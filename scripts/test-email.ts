import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// 加载 .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testEmail() {
  console.log('📧 SMTP配置:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.SMTP_USER, // 发送给自己测试
      subject: 'SoloSales SMTP测试',
      text: '如果你收到这封邮件，说明SMTP配置成功！',
      html: '<b>✅ SMTP配置成功！</b>',
    });

    console.log('✅ 邮件发送成功！');
    console.log('📧 Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ 邮件发送失败:', error);
  }
}

testEmail();
