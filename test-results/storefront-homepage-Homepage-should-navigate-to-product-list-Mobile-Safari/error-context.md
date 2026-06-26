# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: storefront\homepage.spec.ts >> Homepage >> should navigate to product list
- Location: tests\e2e\storefront\homepage.spec.ts:31:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a[href*="products"]').first()
    - locator resolved to <a href="#products" class="inline-flex items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white px-6 py-3 text-sm font-semibold transition-all hover:bg-white/25 hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50">Shop Now</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="p-6 text-center">…</div> from <div id="welcome-modal-container">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <h2 class="text-2xl font-bold text-white">Welcome Gift</h2> from <div id="welcome-modal-container">…</div> subtree intercepts pointer events
  2 × retrying click action
      - waiting 100ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">…</div> from <div id="welcome-modal-container">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e6]:
        - link "S" [ref=e8]:
          - /url: /en
          - generic [ref=e10]: S
        - generic [ref=e11]:
          - button "Search products..." [ref=e12]:
            - img
          - button [ref=e14]:
            - img
          - button [ref=e15]:
            - img
          - button [ref=e17]:
            - img
            - img
    - main [ref=e18]:
      - region "Hero Banner" [ref=e19]:
        - generic [ref=e31]:
          - heading "Discover Premium Products" [level=1] [ref=e32]
          - paragraph [ref=e33]: Curated selection of high-quality items at unbeatable prices. Shop now and elevate your everyday experience.
          - generic [ref=e34]:
            - link "Shop Now" [ref=e35]:
              - /url: "#products"
            - link "Learn More" [ref=e36]:
              - /url: "#features"
      - generic [ref=e40]:
        - heading "Featured Products" [level=2] [ref=e41]
        - generic [ref=e42]:
          - generic [ref=e44]:
            - generic [ref=e48] [cursor=pointer]:
              - img "Sunset Lamp Projector" [ref=e49]
              - generic [ref=e50]: 🔥 Limited Offer
              - generic [ref=e51]:
                - heading "Sunset Lamp Projector" [level=3] [ref=e52]
                - generic [ref=e53]:
                  - generic [ref=e54]: $21.99
                  - generic [ref=e55]: $30.79
            - generic [ref=e59] [cursor=pointer]:
              - img "Leather Journal Notebook" [ref=e60]
              - generic [ref=e61]: 🔥 Limited Offer
              - generic [ref=e62]:
                - heading "Leather Journal Notebook" [level=3] [ref=e63]
                - generic [ref=e64]:
                  - generic [ref=e65]: $15.99
                  - generic [ref=e66]: $22.39
            - generic [ref=e70] [cursor=pointer]:
              - img "Aromatherapy Diffuser" [ref=e71]
              - generic [ref=e72]: 🔥 Limited Offer
              - generic [ref=e73]:
                - heading "Aromatherapy Diffuser" [level=3] [ref=e74]
                - generic [ref=e75]:
                  - generic [ref=e76]: $24.99
                  - generic [ref=e77]: $34.99
            - generic [ref=e81] [cursor=pointer]:
              - img "Minimalist Plant Pot Set" [ref=e82]
              - generic [ref=e83]: 🔥 Limited Offer
              - generic [ref=e84]:
                - heading "Minimalist Plant Pot Set" [level=3] [ref=e85]
                - generic [ref=e86]:
                  - generic [ref=e87]: $18.99
                  - generic [ref=e88]: $26.59
            - generic [ref=e92] [cursor=pointer]:
              - img "Pour-Over Coffee Maker Set" [ref=e93]
              - generic [ref=e94]: 🔥 Limited Offer
              - generic [ref=e95]:
                - heading "Pour-Over Coffee Maker Set" [level=3] [ref=e96]
                - generic [ref=e97]:
                  - generic [ref=e98]: $26.99
                  - generic [ref=e99]: $37.79
            - generic [ref=e103] [cursor=pointer]:
              - img "Desk Lamp with Wireless Charger"
              - generic [ref=e104]: 🔥 Limited Offer
              - generic [ref=e105]:
                - heading "Desk Lamp with Wireless Charger" [level=3] [ref=e106]
                - generic [ref=e107]:
                  - generic [ref=e108]: $34.99
                  - generic [ref=e109]: $48.99
            - generic [ref=e113] [cursor=pointer]:
              - img "Foam Roller Set"
              - generic [ref=e114]: 🔥 Limited Offer
              - generic [ref=e115]:
                - heading "Foam Roller Set" [level=3] [ref=e116]
                - generic [ref=e117]:
                  - generic [ref=e118]: $19.99
                  - generic [ref=e119]: $27.99
            - generic [ref=e123] [cursor=pointer]:
              - img "Jump Rope with Counter"
              - generic [ref=e124]: 🔥 Limited Offer
              - generic [ref=e125]:
                - heading "Jump Rope with Counter" [level=3] [ref=e126]
                - generic [ref=e127]:
                  - generic [ref=e128]: $12.99
                  - generic [ref=e129]: $18.19
            - generic [ref=e133] [cursor=pointer]:
              - img "Fitness Tracker Watch"
              - generic [ref=e134]: 🔥 Limited Offer
              - generic [ref=e135]:
                - heading "Fitness Tracker Watch" [level=3] [ref=e136]
                - generic [ref=e137]:
                  - generic [ref=e138]: $49.99
                  - generic [ref=e139]: $69.99
            - generic [ref=e143] [cursor=pointer]:
              - img "Adjustable Dumbbells"
              - generic [ref=e144]: 🔥 Limited Offer
              - generic [ref=e145]:
                - heading "Adjustable Dumbbells" [level=3] [ref=e146]
                - generic [ref=e147]:
                  - generic [ref=e148]: $89.99
                  - generic [ref=e149]: $125.99
            - generic [ref=e153] [cursor=pointer]:
              - img "Resistance Bands Set"
              - generic [ref=e154]: 🔥 Limited Offer
              - generic [ref=e155]:
                - heading "Resistance Bands Set" [level=3] [ref=e156]
                - generic [ref=e157]:
                  - generic [ref=e158]: $14.99
                  - generic [ref=e159]: $20.99
            - generic [ref=e163] [cursor=pointer]:
              - img "Premium Yoga Mat"
              - generic [ref=e164]: 🔥 Limited Offer
              - generic [ref=e165]:
                - heading "Premium Yoga Mat" [level=3] [ref=e166]
                - generic [ref=e167]:
                  - generic [ref=e168]: $29.99
                  - generic [ref=e169]: $41.99
            - generic [ref=e173] [cursor=pointer]:
              - img "Phone Stand with Wireless Charging"
              - generic [ref=e174]: 🔥 Limited Offer
              - generic [ref=e175]:
                - heading "Phone Stand with Wireless Charging" [level=3] [ref=e176]
                - generic [ref=e177]:
                  - generic [ref=e178]: $22.99
                  - generic [ref=e179]: $32.19
            - generic [ref=e183] [cursor=pointer]:
              - img "Portable Power Bank 20000mAh"
              - generic [ref=e184]: 🔥 Limited Offer
              - generic [ref=e185]:
                - heading "Portable Power Bank 20000mAh" [level=3] [ref=e186]
                - generic [ref=e187]:
                  - generic [ref=e188]: $27.99
                  - generic [ref=e189]: $39.19
            - generic [ref=e193] [cursor=pointer]:
              - img "USB-C Hub Adapter"
              - generic [ref=e194]: 🔥 Limited Offer
              - generic [ref=e195]:
                - heading "USB-C Hub Adapter" [level=3] [ref=e196]
                - generic [ref=e197]:
                  - generic [ref=e198]: $32.99
                  - generic [ref=e199]: $46.19
            - generic [ref=e203] [cursor=pointer]:
              - img "Fast Wireless Charger"
              - generic [ref=e204]: 🔥 Limited Offer
              - generic [ref=e205]:
                - heading "Fast Wireless Charger" [level=3] [ref=e206]
                - generic [ref=e207]:
                  - generic [ref=e208]: $24.99
                  - generic [ref=e209]: $34.99
            - generic [ref=e213] [cursor=pointer]:
              - img "Magnetic Phone Case"
              - generic [ref=e214]: 🔥 Limited Offer
              - generic [ref=e215]:
                - heading "Magnetic Phone Case" [level=3] [ref=e216]
                - generic [ref=e217]:
                  - generic [ref=e218]: $19.99
                  - generic [ref=e219]: $27.99
            - generic [ref=e223] [cursor=pointer]:
              - img "Wireless Earbuds Pro"
              - generic [ref=e224]: 🔥 Limited Offer
              - generic [ref=e225]:
                - heading "Wireless Earbuds Pro" [level=3] [ref=e226]
                - generic [ref=e227]:
                  - generic [ref=e228]: $29.99
                  - generic [ref=e229]: $41.99
            - generic [ref=e233] [cursor=pointer]:
              - img "Smart Speaker Hub"
              - generic [ref=e234]: 🔥 Limited Offer
              - generic [ref=e235]:
                - heading "Smart Speaker Hub" [level=3] [ref=e236]
                - generic [ref=e237]:
                  - generic [ref=e238]: $39.99
                  - generic [ref=e239]: $55.99
            - generic [ref=e243] [cursor=pointer]:
              - img "Wireless Security Camera"
              - generic [ref=e244]: 🔥 Limited Offer
              - generic [ref=e245]:
                - heading "Wireless Security Camera" [level=3] [ref=e246]
                - generic [ref=e247]:
                  - generic [ref=e248]: $49.99
                  - generic [ref=e249]: $69.99
            - generic [ref=e253] [cursor=pointer]:
              - img "Smart Humidifier with RGB Light"
              - generic [ref=e254]: 🔥 Limited Offer
              - generic [ref=e255]:
                - heading "Smart Humidifier with RGB Light" [level=3] [ref=e256]
                - generic [ref=e257]:
                  - generic [ref=e258]: $34.99
                  - generic [ref=e259]: $48.99
            - generic [ref=e263] [cursor=pointer]:
              - img "Smart Plug Mini"
              - generic [ref=e264]: 🔥 Limited Offer
              - generic [ref=e265]:
                - heading "Smart Plug Mini" [level=3] [ref=e266]
                - generic [ref=e267]:
                  - generic [ref=e268]: $16.99
                  - generic [ref=e269]: $23.79
            - generic [ref=e273] [cursor=pointer]:
              - img "Robot Vacuum Cleaner Pro"
              - generic [ref=e274]: 🔥 Limited Offer
              - generic [ref=e275]:
                - heading "Robot Vacuum Cleaner Pro" [level=3] [ref=e276]
                - generic [ref=e277]:
                  - generic [ref=e278]: $189.99
                  - generic [ref=e279]: $265.99
            - generic [ref=e283] [cursor=pointer]:
              - img "Smart LED Bulb Kit"
              - generic [ref=e284]: 🔥 Limited Offer
              - generic [ref=e285]:
                - heading "Smart LED Bulb Kit" [level=3] [ref=e286]
                - generic [ref=e287]:
                  - generic [ref=e288]: $24.99
                  - generic [ref=e289]: $34.99
          - button "Previous" [ref=e290]:
            - img [ref=e291]
          - button "Next" [ref=e293]:
            - img [ref=e294]
      - generic [ref=e322]:
        - heading "Featured Products" [level=2] [ref=e323]
        - generic [ref=e324]:
          - button "Sunset Lamp Projector -29% Sunset Lamp Projector $21.99 $30.79" [ref=e325] [cursor=pointer]:
            - generic [ref=e326]:
              - img "Sunset Lamp Projector" [ref=e327]
              - generic [ref=e328]:
                - img [ref=e329]
                - text: "-29%"
            - generic [ref=e331]:
              - heading "Sunset Lamp Projector" [level=3] [ref=e332]
              - generic [ref=e333]:
                - generic [ref=e334]: $21.99
                - generic [ref=e335]: $30.79
          - button "Leather Journal Notebook -29% Leather Journal Notebook $15.99 $22.39" [ref=e336] [cursor=pointer]:
            - generic [ref=e337]:
              - img "Leather Journal Notebook" [ref=e338]
              - generic [ref=e339]:
                - img [ref=e340]
                - text: "-29%"
            - generic [ref=e342]:
              - heading "Leather Journal Notebook" [level=3] [ref=e343]
              - generic [ref=e344]:
                - generic [ref=e345]: $15.99
                - generic [ref=e346]: $22.39
          - button "Aromatherapy Diffuser -29% Aromatherapy Diffuser $24.99 $34.99" [ref=e347] [cursor=pointer]:
            - generic [ref=e348]:
              - img "Aromatherapy Diffuser" [ref=e349]
              - generic [ref=e350]:
                - img [ref=e351]
                - text: "-29%"
            - generic [ref=e353]:
              - heading "Aromatherapy Diffuser" [level=3] [ref=e354]
              - generic [ref=e355]:
                - generic [ref=e356]: $24.99
                - generic [ref=e357]: $34.99
          - button "Minimalist Plant Pot Set -29% Minimalist Plant Pot Set $18.99 $26.59" [ref=e358] [cursor=pointer]:
            - generic [ref=e359]:
              - img "Minimalist Plant Pot Set" [ref=e360]
              - generic [ref=e361]:
                - img [ref=e362]
                - text: "-29%"
            - generic [ref=e364]:
              - heading "Minimalist Plant Pot Set" [level=3] [ref=e365]
              - generic [ref=e366]:
                - generic [ref=e367]: $18.99
                - generic [ref=e368]: $26.59
          - button "Pour-Over Coffee Maker Set -29% Pour-Over Coffee Maker Set $26.99 $37.79" [ref=e369] [cursor=pointer]:
            - generic [ref=e370]:
              - img "Pour-Over Coffee Maker Set" [ref=e371]
              - generic [ref=e372]:
                - img [ref=e373]
                - text: "-29%"
            - generic [ref=e375]:
              - heading "Pour-Over Coffee Maker Set" [level=3] [ref=e376]
              - generic [ref=e377]:
                - generic [ref=e378]: $26.99
                - generic [ref=e379]: $37.79
          - button "Desk Lamp with Wireless Charger -29% Desk Lamp with Wireless Charger $34.99 $48.99" [ref=e380] [cursor=pointer]:
            - generic [ref=e381]:
              - img "Desk Lamp with Wireless Charger" [ref=e382]
              - generic [ref=e383]:
                - img [ref=e384]
                - text: "-29%"
            - generic [ref=e386]:
              - heading "Desk Lamp with Wireless Charger" [level=3] [ref=e387]
              - generic [ref=e388]:
                - generic [ref=e389]: $34.99
                - generic [ref=e390]: $48.99
          - button "Foam Roller Set -29% Foam Roller Set $19.99 $27.99" [ref=e391] [cursor=pointer]:
            - generic [ref=e392]:
              - img "Foam Roller Set"
              - generic [ref=e393]:
                - img [ref=e394]
                - text: "-29%"
            - generic [ref=e396]:
              - heading "Foam Roller Set" [level=3] [ref=e397]
              - generic [ref=e398]:
                - generic [ref=e399]: $19.99
                - generic [ref=e400]: $27.99
          - button "Jump Rope with Counter -29% Jump Rope with Counter $12.99 $18.19" [ref=e401] [cursor=pointer]:
            - generic [ref=e402]:
              - img "Jump Rope with Counter"
              - generic [ref=e403]:
                - img [ref=e404]
                - text: "-29%"
            - generic [ref=e406]:
              - heading "Jump Rope with Counter" [level=3] [ref=e407]
              - generic [ref=e408]:
                - generic [ref=e409]: $12.99
                - generic [ref=e410]: $18.19
          - button "Fitness Tracker Watch -29% Fitness Tracker Watch $49.99 $69.99" [ref=e411] [cursor=pointer]:
            - generic [ref=e412]:
              - img "Fitness Tracker Watch"
              - generic [ref=e413]:
                - img [ref=e414]
                - text: "-29%"
            - generic [ref=e416]:
              - heading "Fitness Tracker Watch" [level=3] [ref=e417]
              - generic [ref=e418]:
                - generic [ref=e419]: $49.99
                - generic [ref=e420]: $69.99
          - button "Adjustable Dumbbells -29% Adjustable Dumbbells $89.99 $125.99 Low Stock" [ref=e421] [cursor=pointer]:
            - generic [ref=e422]:
              - img "Adjustable Dumbbells"
              - generic [ref=e423]:
                - img [ref=e424]
                - text: "-29%"
            - generic [ref=e426]:
              - heading "Adjustable Dumbbells" [level=3] [ref=e427]
              - generic [ref=e428]:
                - generic [ref=e429]: $89.99
                - generic [ref=e430]: $125.99
                - generic [ref=e431]: Low Stock
          - button "Resistance Bands Set -29% Resistance Bands Set $14.99 $20.99" [ref=e432] [cursor=pointer]:
            - generic [ref=e433]:
              - img "Resistance Bands Set"
              - generic [ref=e434]:
                - img [ref=e435]
                - text: "-29%"
            - generic [ref=e437]:
              - heading "Resistance Bands Set" [level=3] [ref=e438]
              - generic [ref=e439]:
                - generic [ref=e440]: $14.99
                - generic [ref=e441]: $20.99
          - button "Premium Yoga Mat -29% Premium Yoga Mat $29.99 $41.99" [ref=e442] [cursor=pointer]:
            - generic [ref=e443]:
              - img "Premium Yoga Mat"
              - generic [ref=e444]:
                - img [ref=e445]
                - text: "-29%"
            - generic [ref=e447]:
              - heading "Premium Yoga Mat" [level=3] [ref=e448]
              - generic [ref=e449]:
                - generic [ref=e450]: $29.99
                - generic [ref=e451]: $41.99
          - button "Phone Stand with Wireless Charging -29% Phone Stand with Wireless Charging $22.99 $32.19" [ref=e452] [cursor=pointer]:
            - generic [ref=e453]:
              - img "Phone Stand with Wireless Charging"
              - generic [ref=e454]:
                - img [ref=e455]
                - text: "-29%"
            - generic [ref=e457]:
              - heading "Phone Stand with Wireless Charging" [level=3] [ref=e458]
              - generic [ref=e459]:
                - generic [ref=e460]: $22.99
                - generic [ref=e461]: $32.19
          - button "Portable Power Bank 20000mAh -29% Portable Power Bank 20000mAh $27.99 $39.19" [ref=e462] [cursor=pointer]:
            - generic [ref=e463]:
              - img "Portable Power Bank 20000mAh"
              - generic [ref=e464]:
                - img [ref=e465]
                - text: "-29%"
            - generic [ref=e467]:
              - heading "Portable Power Bank 20000mAh" [level=3] [ref=e468]
              - generic [ref=e469]:
                - generic [ref=e470]: $27.99
                - generic [ref=e471]: $39.19
          - button "USB-C Hub Adapter -29% USB-C Hub Adapter $32.99 $46.19" [ref=e472] [cursor=pointer]:
            - generic [ref=e473]:
              - img "USB-C Hub Adapter"
              - generic [ref=e474]:
                - img [ref=e475]
                - text: "-29%"
            - generic [ref=e477]:
              - heading "USB-C Hub Adapter" [level=3] [ref=e478]
              - generic [ref=e479]:
                - generic [ref=e480]: $32.99
                - generic [ref=e481]: $46.19
          - button "Fast Wireless Charger -29% Fast Wireless Charger $24.99 $34.99" [ref=e482] [cursor=pointer]:
            - generic [ref=e483]:
              - img "Fast Wireless Charger"
              - generic [ref=e484]:
                - img [ref=e485]
                - text: "-29%"
            - generic [ref=e487]:
              - heading "Fast Wireless Charger" [level=3] [ref=e488]
              - generic [ref=e489]:
                - generic [ref=e490]: $24.99
                - generic [ref=e491]: $34.99
          - button "Magnetic Phone Case -29% Magnetic Phone Case $19.99 $27.99" [ref=e492] [cursor=pointer]:
            - generic [ref=e493]:
              - img "Magnetic Phone Case"
              - generic [ref=e494]:
                - img [ref=e495]
                - text: "-29%"
            - generic [ref=e497]:
              - heading "Magnetic Phone Case" [level=3] [ref=e498]
              - generic [ref=e499]:
                - generic [ref=e500]: $19.99
                - generic [ref=e501]: $27.99
          - button "Wireless Earbuds Pro -29% Wireless Earbuds Pro $29.99 $41.99" [ref=e502] [cursor=pointer]:
            - generic [ref=e503]:
              - img "Wireless Earbuds Pro"
              - generic [ref=e504]:
                - img [ref=e505]
                - text: "-29%"
            - generic [ref=e507]:
              - heading "Wireless Earbuds Pro" [level=3] [ref=e508]
              - generic [ref=e509]:
                - generic [ref=e510]: $29.99
                - generic [ref=e511]: $41.99
          - button "Smart Speaker Hub -29% Smart Speaker Hub $39.99 $55.99" [ref=e512] [cursor=pointer]:
            - generic [ref=e513]:
              - img "Smart Speaker Hub"
              - generic [ref=e514]:
                - img [ref=e515]
                - text: "-29%"
            - generic [ref=e517]:
              - heading "Smart Speaker Hub" [level=3] [ref=e518]
              - generic [ref=e519]:
                - generic [ref=e520]: $39.99
                - generic [ref=e521]: $55.99
          - button "Wireless Security Camera -29% Wireless Security Camera $49.99 $69.99" [ref=e522] [cursor=pointer]:
            - generic [ref=e523]:
              - img "Wireless Security Camera"
              - generic [ref=e524]:
                - img [ref=e525]
                - text: "-29%"
            - generic [ref=e527]:
              - heading "Wireless Security Camera" [level=3] [ref=e528]
              - generic [ref=e529]:
                - generic [ref=e530]: $49.99
                - generic [ref=e531]: $69.99
          - button "Smart Humidifier with RGB Light -29% Smart Humidifier with RGB Light $34.99 $48.99" [ref=e532] [cursor=pointer]:
            - generic [ref=e533]:
              - img "Smart Humidifier with RGB Light"
              - generic [ref=e534]:
                - img [ref=e535]
                - text: "-29%"
            - generic [ref=e537]:
              - heading "Smart Humidifier with RGB Light" [level=3] [ref=e538]
              - generic [ref=e539]:
                - generic [ref=e540]: $34.99
                - generic [ref=e541]: $48.99
          - button "Smart Plug Mini -29% Smart Plug Mini $16.99 $23.79" [ref=e542] [cursor=pointer]:
            - generic [ref=e543]:
              - img "Smart Plug Mini"
              - generic [ref=e544]:
                - img [ref=e545]
                - text: "-29%"
            - generic [ref=e547]:
              - heading "Smart Plug Mini" [level=3] [ref=e548]
              - generic [ref=e549]:
                - generic [ref=e550]: $16.99
                - generic [ref=e551]: $23.79
          - button "Robot Vacuum Cleaner Pro -29% Robot Vacuum Cleaner Pro $189.99 $265.99 Low Stock" [ref=e552] [cursor=pointer]:
            - generic [ref=e553]:
              - img "Robot Vacuum Cleaner Pro"
              - generic [ref=e554]:
                - img [ref=e555]
                - text: "-29%"
            - generic [ref=e557]:
              - heading "Robot Vacuum Cleaner Pro" [level=3] [ref=e558]
              - generic [ref=e559]:
                - generic [ref=e560]: $189.99
                - generic [ref=e561]: $265.99
                - generic [ref=e562]: Low Stock
          - button "Smart LED Bulb Kit -29% Smart LED Bulb Kit $24.99 $34.99" [ref=e563] [cursor=pointer]:
            - generic [ref=e564]:
              - img "Smart LED Bulb Kit"
              - generic [ref=e565]:
                - img [ref=e566]
                - text: "-29%"
            - generic [ref=e568]:
              - heading "Smart LED Bulb Kit" [level=3] [ref=e569]
              - generic [ref=e570]:
                - generic [ref=e571]: $24.99
                - generic [ref=e572]: $34.99
      - generic [ref=e576]:
        - generic [ref=e577]:
          - img [ref=e579]
          - heading "Fast Response" [level=3] [ref=e584]
          - paragraph [ref=e585]: Lightning delivery, fast shipping
        - generic [ref=e586]:
          - img [ref=e588]
          - heading "Secure Payment" [level=3] [ref=e590]
          - paragraph [ref=e591]: Multi-layer encryption ensures transaction security
        - generic [ref=e592]:
          - img [ref=e594]
          - heading "Free Returns" [level=3] [ref=e598]
          - paragraph [ref=e599]: 7-day hassle-free returns with shipping insurance
        - generic [ref=e600]:
          - img [ref=e602]
          - heading "24/7 Support" [level=3] [ref=e604]
          - paragraph [ref=e605]: Round-the-clock support, always here for you
      - generic [ref=e608]:
        - generic [ref=e609]:
          - generic [ref=e610]:
            - generic [ref=e611]:
              - generic [ref=e613]: S
              - generic [ref=e614]: SoloSales
            - paragraph [ref=e615]: High-quality independent store for TikTok trending products
          - region [ref=e617]:
            - heading "Shop" [level=3] [ref=e619]:
              - button "Shop" [ref=e620]:
                - text: Shop
                - img
            - heading "Company" [level=3] [ref=e622]:
              - button "Company" [ref=e623]:
                - text: Company
                - img
          - generic [ref=e624]:
            - heading "Newsletter" [level=3] [ref=e625]
            - paragraph [ref=e626]: Subscribe for the latest deals and product updates
            - generic [ref=e627]:
              - generic [ref=e628]:
                - img [ref=e629]
                - textbox "Enter your email" [ref=e632]
              - button [ref=e633]:
                - img
            - generic [ref=e634]:
              - link "Facebook" [ref=e635]:
                - /url: https://facebook.com
                - img [ref=e636]
              - link "Instagram" [ref=e638]:
                - /url: https://instagram.com
                - img [ref=e639]
              - link "X" [ref=e642]:
                - /url: https://x.com
                - img [ref=e643]
              - link "TikTok" [ref=e645]:
                - /url: https://tiktok.com
                - img [ref=e646]
        - generic [ref=e648]:
          - generic [ref=e649]:
            - generic [ref=e651]: Visa
            - generic [ref=e652]:
              - generic [ref=e653]: "|"
              - generic [ref=e654]: Mastercard
            - generic [ref=e655]:
              - generic [ref=e656]: "|"
              - generic [ref=e657]: Stripe
          - paragraph [ref=e658]: © 2026 SoloSales Shop. All rights reserved.
    - generic [ref=e660]:
      - button [ref=e661]:
        - img [ref=e662]
      - generic [ref=e665]:
        - generic [ref=e666]: 🎁
        - heading "Welcome Gift" [level=2] [ref=e667]
      - generic [ref=e668]:
        - generic [ref=e669]: $5 OFF
        - paragraph [ref=e670]: $5 off your first order, valid on all products
        - generic [ref=e671]:
          - generic [ref=e672]: Coupon Code
          - generic [ref=e673]: NEWUSER5
        - button "Claim Now" [ref=e674]
        - paragraph [ref=e675]: "* Valid for 30 days, cannot be combined with other offers"
  - navigation "Bottom Navigation" [ref=e676]:
    - generic [ref=e677]:
      - link "Home" [ref=e678]:
        - /url: /en
        - img [ref=e680]
        - generic [ref=e683]: Home
      - link "Search" [ref=e684]:
        - /url: /en/search
        - img [ref=e686]
        - generic [ref=e689]: Search
      - link "Cart" [ref=e690]:
        - /url: /en/cart
        - img [ref=e692]
        - generic [ref=e695]: Cart
      - link "Profile" [ref=e696]:
        - /url: /en/profile
        - img [ref=e698]
        - generic [ref=e701]: Profile
  - region "Notifications alt+T"
  - generic [ref=e704]:
    - img [ref=e706]
    - button "Open Tanstack query devtools" [ref=e774]:
      - img [ref=e775]
  - generic [ref=e849]:
    - button "Open Next.js Dev Tools" [ref=e850]:
      - img [ref=e851]
    - generic [ref=e856]:
      - button "Open issues overlay" [ref=e857]:
        - generic [ref=e858]:
          - generic [ref=e859]: "0"
          - generic [ref=e860]: "1"
        - generic [ref=e861]: Issue
      - button "Collapse issues badge" [ref=e862]:
        - img [ref=e863]
  - alert [ref=e865]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Homepage', () => {
  4  |   test('should load successfully', async ({ page }) => {
  5  |     await page.goto('/');
  6  | 
  7  |     // Wait for page to load
  8  |     await page.waitForLoadState('networkidle');
  9  | 
  10 |     // Check if title is visible
  11 |     await expect(page.locator('h1')).toBeVisible();
  12 | 
  13 |     // Take screenshot for visual review
  14 |     await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
  15 |   });
  16 | 
  17 |   test('should display Klein Blue theme colors', async ({ page }) => {
  18 |     await page.goto('/');
  19 | 
  20 |     // Check if brand colors are applied (Klein Blue)
  21 |     const brandButton = page.locator('button[class*="bg-brand"]').first();
  22 |     if (await brandButton.isVisible()) {
  23 |       const bgColor = await brandButton.evaluate((el) =>
  24 |         window.getComputedStyle(el).backgroundColor
  25 |       );
  26 |       // Klein Blue should have blue tone
  27 |       expect(bgColor).toBeTruthy();
  28 |     }
  29 |   });
  30 | 
  31 |   test('should navigate to product list', async ({ page }) => {
  32 |     await page.goto('/');
  33 | 
  34 |     // Click on navigation link to products
  35 |     const productsLink = page.locator('a[href*="products"]').first();
> 36 |     await productsLink.click();
     |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  37 | 
  38 |     // Verify navigation
  39 |     await expect(page).toHaveURL(/products/);
  40 |   });
  41 | });
  42 | 
```