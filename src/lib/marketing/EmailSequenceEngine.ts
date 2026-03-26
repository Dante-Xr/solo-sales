import { PrismaClient, TriggerType, SequenceStatus, EnrollmentStatus, Prisma } from '@prisma/client'
import { cacheGet, cacheSet } from '../cache'
import { safeErrorLog } from '../safeLog'

const CACHE_TTL = 300

interface TriggerContext {
  userId: string
  userEmail: string
  data?: Record<string, unknown>
}

class EmailSequenceEngine {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getSequences(filters?: {
    trigger?: TriggerType
    status?: SequenceStatus
  }) {
    const cacheKey = `solo:sequences:list:${JSON.stringify(filters || {})}`
    const cached = await cacheGet<typeof sequences>(cacheKey)

    if (cached) {
      return cached
    }

    const where: Record<string, unknown> = {}

    if (filters?.trigger) {
      where.trigger = filters.trigger
    }

    if (filters?.status) {
      where.status = filters.status
    }

    const sequences = await this.prisma.emailSequence.findMany({
      where,
      include: {
        steps: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    await cacheSet(cacheKey, JSON.stringify(sequences), CACHE_TTL)
    return sequences
  }

  async getSequenceById(id: string) {
    return this.prisma.emailSequence.findUnique({
      where: { id },
      include: {
        steps: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    })
  }

  async createSequence(data: {
    name: string
    description?: string
    trigger: TriggerType
    steps?: Array<{
      name: string
      order: number
      templateId: string
      delayHours: number
      condition?: Record<string, unknown>
    }>
  }) {
    return this.prisma.emailSequence.create({
      data: {
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        steps: data.steps ? {
          create: data.steps.map((step, index) => ({
            name: step.name,
            order: step.order ?? index,
            templateId: step.templateId,
            delayHours: step.delayHours ?? 0,
            condition: step.condition as Prisma.InputJsonValue
          }))
        } : undefined
      },
      include: {
        steps: true
      }
    })
  }

  async updateSequence(id: string, data: {
    name?: string
    description?: string
    status?: SequenceStatus
    isActive?: boolean
  }) {
    return this.prisma.emailSequence.update({
      where: { id },
      data: {
        ...data,
        ...(data.isActive !== undefined && { isActive: data.isActive })
      },
      include: {
        steps: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    })
  }

  async deleteSequence(id: string) {
    return this.prisma.emailSequence.delete({
      where: { id }
    })
  }

  async addStep(sequenceId: string, data: {
    name: string
    templateId: string
    delayHours?: number
    condition?: Record<string, unknown>
  }) {
    const maxOrder = await this.prisma.emailSequenceStep.aggregate({
      where: { sequenceId },
      _max: { order: true }
    })

    return this.prisma.emailSequenceStep.create({
      data: {
        sequenceId,
        name: data.name,
        order: (maxOrder._max.order ?? -1) + 1,
        templateId: data.templateId,
        delayHours: data.delayHours ?? 0,
        condition: data.condition as Prisma.InputJsonValue
      }
    })
  }

  async enrollUser(sequenceId: string, userId: string, triggerData?: Record<string, unknown>) {
    const existing = await this.prisma.emailSequenceEnrollment.findUnique({
      where: {
        sequenceId_userId: {
          sequenceId,
          userId
        }
      }
    })

    if (existing) {
      if (existing.status === EnrollmentStatus.COMPLETED) {
        return null
      }

      return this.prisma.emailSequenceEnrollment.update({
        where: { id: existing.id },
        data: {
          status: EnrollmentStatus.ACTIVE,
          currentStep: 0,
          pausedAt: null,
          triggerData: triggerData as Prisma.InputJsonValue
        }
      })
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    if (!user?.email) {
      return null
    }

    return this.prisma.emailSequenceEnrollment.create({
      data: {
        sequenceId,
        userId,
        status: EnrollmentStatus.ACTIVE,
        triggerData: triggerData as Prisma.InputJsonValue
      }
    })
  }

  async unenroll(sequenceId: string, userId: string) {
    return this.prisma.emailSequenceEnrollment.update({
      where: {
        sequenceId_userId: {
          sequenceId,
          userId
        }
      },
      data: {
        status: EnrollmentStatus.UNENROLLED
      }
    })
  }

  async pauseEnrollment(sequenceId: string, userId: string) {
    return this.prisma.emailSequenceEnrollment.update({
      where: {
        sequenceId_userId: {
          sequenceId,
          userId
        }
      },
      data: {
        status: EnrollmentStatus.PAUSED,
        pausedAt: new Date()
      }
    })
  }

  async resumeEnrollment(sequenceId: string, userId: string) {
    return this.prisma.emailSequenceEnrollment.update({
      where: {
        sequenceId_userId: {
          sequenceId,
          userId
        }
      },
      data: {
        status: EnrollmentStatus.ACTIVE,
        pausedAt: null
      }
    })
  }

  async processTrigger(trigger: TriggerType, context: TriggerContext) {
    const sequences = await this.prisma.emailSequence.findMany({
      where: {
        trigger,
        isActive: true,
        status: SequenceStatus.ACTIVE
      },
      include: {
        steps: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    const results: Array<{
      sequenceId: string
      enrolled: boolean
      error?: string
    }> = []

    for (const sequence of sequences) {
      try {
        const enrollment = await this.enrollUser(sequence.id, context.userId, context.data)

        if (enrollment) {
          await this.processEnrollment(sequence.id, context.userId)
          results.push({ sequenceId: sequence.id, enrolled: true })
        }
      } catch (error) {
        safeErrorLog(`Trigger processing error for sequence ${sequence.id}`, error)
        results.push({
          sequenceId: sequence.id,
          enrolled: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  async processEnrollment(sequenceId: string, userId: string) {
    const enrollment = await this.prisma.emailSequenceEnrollment.findUnique({
      where: {
        sequenceId_userId: {
          sequenceId,
          userId
        }
      },
      include: {
        sequence: {
          include: {
            steps: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      return
    }

    const currentStepIndex = enrollment.currentStep
    const steps = enrollment.sequence.steps

    if (currentStepIndex >= steps.length) {
      await this.prisma.emailSequenceEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: EnrollmentStatus.COMPLETED,
          completedAt: new Date()
        }
      })
      return
    }

    const currentStep = steps[currentStepIndex]

    if (currentStep.delayHours > 0) {
      const hoursSinceEnrollment = enrollment.lastTriggerAt
        ? (Date.now() - enrollment.lastTriggerAt.getTime()) / (1000 * 60 * 60)
        : null

      if (hoursSinceEnrollment !== null && hoursSinceEnrollment < currentStep.delayHours) {
        return
      }
    }

    await this.sendStepEmail(enrollment, currentStep)
  }

  private async sendStepEmail(
    enrollment: { id: string; userId: string },
    step: { id: string; templateId: string }
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: enrollment.userId },
      select: { email: true }
    })

    if (!user?.email) {
      await this.prisma.emailSequenceLog.create({
        data: {
          sequenceId: '',
          stepId: step.id,
          userId: enrollment.userId,
          enrollmentId: enrollment.id,
          email: '',
          status: 'FAILED',
          errorMessage: 'User email not found'
        }
      })
      return
    }

    await this.prisma.emailSequenceEnrollment.update({
      where: { id: enrollment.id },
      data: { lastTriggerAt: new Date() }
    })

    await this.prisma.emailSequenceLog.create({
      data: {
        sequenceId: '',
        stepId: step.id,
        userId: enrollment.userId,
        enrollmentId: enrollment.id,
        email: user.email,
        status: 'SENT',
        sentAt: new Date()
      }
    })

    await this.prisma.emailSequenceEnrollment.update({
      where: { id: enrollment.id },
      data: { currentStep: { increment: 1 } }
    })
  }

  async getEnrollmentStats(sequenceId: string) {
    const [total, active, completed, unsubscribed, failed] = await Promise.all([
      this.prisma.emailSequenceEnrollment.count({
        where: { sequenceId }
      }),
      this.prisma.emailSequenceEnrollment.count({
        where: { sequenceId, status: EnrollmentStatus.ACTIVE }
      }),
      this.prisma.emailSequenceEnrollment.count({
        where: { sequenceId, status: EnrollmentStatus.COMPLETED }
      }),
      this.prisma.emailSequenceEnrollment.count({
        where: { sequenceId, status: EnrollmentStatus.UNENROLLED }
      }),
      this.prisma.emailSequenceEnrollment.count({
        where: { sequenceId, status: EnrollmentStatus.FAILED }
      })
    ])

    return { total, active, completed, unsubscribed, failed }
  }

  async getSequencesByUser(userId: string) {
    return this.prisma.emailSequenceEnrollment.findMany({
      where: { userId },
      include: {
        sequence: {
          include: {
            steps: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })
  }
}

export default EmailSequenceEngine
