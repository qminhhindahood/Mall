// Frozen reviewed legacy data. No inferred reverse directions. See evidence/shared-routing-r1.
export const reviewedFixtures = {
  "revision": "reviewed-routing-fixtures-r1",
  "areaNetworks": [
    {
      "mall": "saigon-centre",
      "floor": "L5",
      "image": "/routing/saigon-L5.png",
      "size": [
        1632,
        1522
      ],
      "view": "530 340 670 370",
      "starts": [
        "zone-a"
      ],
      "source": "saigon-centre-so-do-tang-L5-2026-10-01.png",
      "nodes": [
        {
          "id": "zone-a",
          "x": 875,
          "y": 645,
          "label": {
            "en": "Public concourse beside Zone A lifts",
            "vi": "Lối đi chung cạnh thang máy Zone A"
          }
        },
        {
          "id": "west",
          "x": 805,
          "y": 625,
          "label": {
            "en": "Concourse below Dim Tu Tac",
            "vi": "Lối đi phía dưới khu Dim Tu Tac trên sơ đồ"
          }
        },
        {
          "id": "dim",
          "x": 790,
          "y": 609,
          "label": {
            "en": "Dim Tu Tac area frontage",
            "vi": "Phía trước khu Dim Tu Tac"
          }
        },
        {
          "id": "longjing",
          "x": 650,
          "y": 589,
          "label": {
            "en": "LONGJING area frontage",
            "vi": "Phía trước khu LONGJING"
          }
        },
        {
          "id": "chang",
          "x": 1060,
          "y": 591,
          "label": {
            "en": "Chang Kang Kung area frontage",
            "vi": "Phía trước khu Chang Kang Kung"
          }
        }
      ],
      "edges": [
        {
          "from": "zone-a",
          "to": "west",
          "instruction": {
            "en": "Follow the open concourse to the left on the plan, toward Dim Tu Tac.",
            "vi": "Theo lối đi chung sang trái trên sơ đồ, về phía Dim Tu Tac."
          }
        },
        {
          "from": "west",
          "to": "dim",
          "instruction": {
            "en": "Approach the edge of the labelled Dim Tu Tac area. Stop in the public concourse.",
            "vi": "Đến cạnh khu Dim Tu Tac được ghi tên. Dừng tại lối đi chung."
          }
        },
        {
          "from": "west",
          "to": "longjing",
          "instruction": {
            "en": "Continue left along the open concourse to the frontage below LONGJING on the plan.",
            "vi": "Đi tiếp sang trái theo lối đi chung đến phía trước LONGJING, bên dưới khu này trên sơ đồ."
          }
        },
        {
          "from": "zone-a",
          "to": "chang",
          "instruction": {
            "en": "Follow the open concourse to the right on the plan, along the frontage of Chang Kang Kung.",
            "vi": "Theo lối đi chung sang phải trên sơ đồ đến phía trước khu Chang Kang Kung."
          }
        }
      ],
      "endpoints": [
        {
          "destinationId": "saigon-prototype-dimtutac",
          "areaId": "research-l5-l5-14",
          "node": "dim"
        },
        {
          "destinationId": "saigon-prototype-longjing",
          "areaId": "research-l5-r4-l5-region-004",
          "node": "longjing"
        },
        {
          "destinationId": "saigon-prototype-changkangkung",
          "areaId": "research-l5-l5-01",
          "node": "chang"
        }
      ]
    },
    {
      "mall": "vincom-dong-khoi",
      "floor": "B3",
      "image": "/routing/vincom-B3.webp",
      "size": [
        1320,
        1077
      ],
      "view": "270 440 390 405",
      "starts": [
        "escalator"
      ],
      "source": "tang-b3.webp",
      "nodes": [
        {
          "id": "escalator",
          "x": 405,
          "y": 507,
          "label": {
            "en": "Public aisle to the right of the escalator beside B3-13 on the plan",
            "vi": "Lối đi chung bên phải thang cuốn cạnh B3-13 trên sơ đồ"
          }
        },
        {
          "id": "siam",
          "x": 405,
          "y": 480,
          "label": {
            "en": "Siam Sugar area, B3-13 frontage",
            "vi": "Phía trước khu Siam Sugar, B3-13"
          }
        },
        {
          "id": "aisle-beside-b3-11",
          "x": 405,
          "y": 545,
          "label": {
            "en": "Public aisle beside B3-11 frontage",
            "vi": "Lối đi chung phía trước B3-11"
          }
        },
        {
          "id": "south",
          "x": 405,
          "y": 620,
          "label": {
            "en": "Aisle junction below B3-15B",
            "vi": "Giao lối đi phía dưới B3-15B trên sơ đồ"
          }
        },
        {
          "id": "bottom",
          "x": 405,
          "y": 758,
          "label": {
            "en": "Aisle above B3-01",
            "vi": "Lối đi phía trên B3-01 trên sơ đồ"
          }
        },
        {
          "id": "chang",
          "x": 430,
          "y": 758,
          "label": {
            "en": "Chang Kang Kung area, B3-01 frontage",
            "vi": "Phía trước khu Chang Kang Kung, B3-01"
          }
        },
        {
          "id": "corner",
          "x": 510,
          "y": 758,
          "label": {
            "en": "Aisle beside B3-01",
            "vi": "Lối đi cạnh B3-01"
          }
        },
        {
          "id": "turn",
          "x": 510,
          "y": 738,
          "label": {
            "en": "Aisle below B3-04",
            "vi": "Lối đi phía dưới B3-04 trên sơ đồ"
          }
        },
        {
          "id": "chilli",
          "x": 570,
          "y": 738,
          "label": {
            "en": "Chilli Thai area, B3-01A frontage",
            "vi": "Phía trước khu Chilli Thai, B3-01A"
          }
        }
      ],
      "edges": [
        {
          "from": "escalator",
          "to": "siam",
          "instruction": {
            "en": "Follow the aisle upward on the plan to the side of B3-13, the Siam Sugar area.",
            "vi": "Theo lối đi lên phía trên sơ đồ đến cạnh B3-13, khu Siam Sugar."
          }
        },
        {
          "from": "escalator",
          "to": "aisle-beside-b3-11",
          "instruction": {
            "en": "Follow the public aisle downward on the plan to the frontage beside B3-11.",
            "vi": "Theo lối đi chung xuống phía dưới sơ đồ đến phía trước B3-11."
          }
        },
        {
          "from": "aisle-beside-b3-11",
          "to": "south",
          "instruction": {
            "en": "Continue down the public aisle on the plan, passing B3-15A and B3-15B on the right side of the plan.",
            "vi": "Đi tiếp xuống phía dưới theo lối đi chung trên sơ đồ, qua B3-15A và B3-15B ở phía bên phải sơ đồ."
          }
        },
        {
          "from": "south",
          "to": "bottom",
          "instruction": {
            "en": "Continue straight between B3-06 and B3-05 to the aisle above B3-01.",
            "vi": "Đi thẳng giữa B3-06 và B3-05 đến lối đi phía trên B3-01 trên sơ đồ."
          }
        },
        {
          "from": "bottom",
          "to": "chang",
          "instruction": {
            "en": "Turn left as you walk (right on the plan) to the frontage of B3-01, Chang Kang Kung.",
            "vi": "Rẽ trái theo hướng đang đi (sang phải trên sơ đồ) đến phía trước B3-01, Chang Kang Kung."
          }
        },
        {
          "from": "bottom",
          "to": "corner",
          "instruction": {
            "en": "Turn toward the right on the plan, following the aisle above B3-01.",
            "vi": "Rẽ sang phải trên sơ đồ, theo lối đi phía trên B3-01."
          }
        },
        {
          "from": "corner",
          "to": "turn",
          "instruction": {
            "en": "Bend upward on the plan into the aisle below B3-04.",
            "vi": "Rẽ lên phía trên sơ đồ vào lối đi phía dưới B3-04."
          }
        },
        {
          "from": "turn",
          "to": "chilli",
          "instruction": {
            "en": "Follow the aisle rightward on the plan to the frontage above B3-01A, Chilli Thai.",
            "vi": "Theo lối đi sang phải trên sơ đồ đến phía trước B3-01A, Chilli Thai."
          }
        }
      ],
      "endpoints": [
        {
          "destinationId": "vincom-prototype-siamsugar",
          "areaId": "research-b3-b3-13",
          "node": "siam"
        },
        {
          "destinationId": "vincom-prototype-changkangkung",
          "areaId": "research-b3-b3-01",
          "node": "chang"
        },
        {
          "destinationId": "vincom-prototype-chillithai",
          "areaId": "research-b3-b3-01a",
          "node": "chilli"
        },
        {
          "destinationId": "vincom-prototype-highlandscoffee",
          "areaId": "supplement-20261021-prototype-highlandscoffee",
          "node": "aisle-beside-b3-11"
        }
      ]
    }
  ],
  "plans": [
    {
      "from": "saigon-prototype-calvinklein",
      "to": "saigon-prototype-mlb",
      "connection": {
        "id": "saigon-zone-a-l2-l3",
        "mall": "saigon-centre",
        "floors": [
          "L2",
          "L3"
        ]
      },
      "legs": [
        {
          "floor": "L2",
          "hash": "4749dd738ea148407c334396183ef917711f4ff10fbfaa796a7ff6f31ede4fd5",
          "points": [
            [
              2813,
              1220
            ],
            [
              2954,
              1530
            ],
            [
              3076,
              1851
            ],
            [
              3205,
              2192
            ],
            [
              3235,
              2348
            ],
            [
              3027,
              2431
            ],
            [
              2518,
              2578
            ],
            [
              2457,
              2510
            ]
          ]
        },
        {
          "floor": "L3",
          "hash": "905e5de4c90debbabddd8a7fadf9e47b5084bf6b01703ba5450b9e8603763ab8",
          "points": [
            [
              2619,
              2573
            ],
            [
              2688,
              2610
            ],
            [
              3008,
              2526
            ]
          ]
        }
      ],
      "steps": [
        {
          "floor": "L2",
          "text": "Start in the public aisle beside CALVIN KLEIN. Follow the marked outer shopping aisle past Armani Exchange, Pedro and ALDO."
        },
        {
          "floor": "L2",
          "text": "Follow the bend around LYN, then continue along the public concourse in front of Weekend by Max Mara toward Zone A."
        },
        {
          "floor": "L2",
          "text": "Reach the public landing beside the Zone A lifts. Stay in the concourse outside the marked service areas."
        },
        {
          "floor": "L2",
          "transferTo": "L3",
          "text": "Check that the Zone A lift serves L3, then take it to L3. If unavailable, ask mall staff. This transfer is paired from the named areas on the plans."
        },
        {
          "floor": "L3",
          "text": "After reaching L3, follow the marked public aisle around the service rectangle beside Zone A, toward MLB."
        },
        {
          "floor": "L3",
          "text": "Stop at the MLB area frontage. The map does not identify an exact doorway."
        }
      ]
    },
    {
      "from": "saigon-prototype-mlb",
      "to": "saigon-prototype-calvinklein",
      "connection": {
        "id": "saigon-zone-a-l2-l3",
        "mall": "saigon-centre",
        "floors": [
          "L2",
          "L3"
        ]
      },
      "legs": [
        {
          "floor": "L3",
          "hash": "905e5de4c90debbabddd8a7fadf9e47b5084bf6b01703ba5450b9e8603763ab8",
          "points": [
            [
              3008,
              2526
            ],
            [
              2688,
              2610
            ],
            [
              2619,
              2573
            ]
          ]
        },
        {
          "floor": "L2",
          "hash": "4749dd738ea148407c334396183ef917711f4ff10fbfaa796a7ff6f31ede4fd5",
          "points": [
            [
              2457,
              2510
            ],
            [
              2518,
              2578
            ],
            [
              3027,
              2431
            ],
            [
              3235,
              2348
            ],
            [
              3205,
              2192
            ],
            [
              3076,
              1851
            ],
            [
              2954,
              1530
            ],
            [
              2813,
              1220
            ]
          ]
        }
      ],
      "steps": [
        {
          "floor": "L3",
          "text": "From the public aisle in front of MLB, follow the marked aisle toward the central atrium and Zone A lifts. Stay outside the emergency/service rectangle."
        },
        {
          "floor": "L3",
          "transferTo": "L2",
          "text": "At Zone A, check that the lift serves L2. Take it to L2; if unavailable, ask mall staff. This transfer is paired from the named areas on the plans."
        },
        {
          "floor": "L2",
          "text": "After reaching L2, use the public concourse beside Zone A. Follow the marked bend past Weekend by Max Mara and around LYN."
        },
        {
          "floor": "L2",
          "text": "Continue along the outer shopping aisle past ALDO, Pedro and Armani Exchange toward CALVIN KLEIN."
        },
        {
          "floor": "L2",
          "text": "Stop at the CALVIN KLEIN area frontage. The map does not identify an exact doorway."
        }
      ]
    }
  ],
  "planInstructionVi": {
    "From the public aisle in front of MLB, follow the marked aisle toward the central atrium and Zone A lifts. Stay outside the emergency/service rectangle.": "Từ lối đi chung trước MLB, theo lối được đánh dấu về phía giếng trời trung tâm và thang máy Zone A. Đi bên ngoài khu kỹ thuật/thoát hiểm hình chữ nhật.",
    "At Zone A, check that the lift serves L2. Take it to L2; if unavailable, ask mall staff. This transfer is paired from the named areas on the plans.": "Tại Zone A, kiểm tra thang máy có phục vụ L2. Đi đến L2; nếu không sử dụng được, hãy hỏi nhân viên. Kết nối này được đối chiếu theo các khu có tên trên sơ đồ.",
    "After reaching L2, use the public concourse beside Zone A. Follow the marked bend past Weekend by Max Mara and around LYN.": "Sau khi đến L2, theo lối đi chung cạnh Zone A. Theo đoạn rẽ được đánh dấu qua Weekend by Max Mara và vòng quanh LYN.",
    "Continue along the outer shopping aisle past ALDO, Pedro and Armani Exchange toward CALVIN KLEIN.": "Tiếp tục theo lối mua sắm phía ngoài, qua ALDO, Pedro và Armani Exchange về phía CALVIN KLEIN.",
    "Stop at the CALVIN KLEIN area frontage. The map does not identify an exact doorway.": "Dừng trước khu CALVIN KLEIN. Sơ đồ không xác định chính xác cửa ra vào.",
    "Start in the public aisle beside CALVIN KLEIN. Follow the marked outer shopping aisle past Armani Exchange, Pedro and ALDO.": "Bắt đầu tại lối đi chung cạnh CALVIN KLEIN. Theo lối mua sắm phía ngoài được đánh dấu, qua Armani Exchange, Pedro và ALDO.",
    "Follow the bend around LYN, then continue along the public concourse in front of Weekend by Max Mara toward Zone A.": "Theo đoạn rẽ vòng quanh LYN, rồi tiếp tục theo lối đi chung trước Weekend by Max Mara về phía Zone A.",
    "Reach the public landing beside the Zone A lifts. Stay in the concourse outside the marked service areas.": "Đến sảnh chung cạnh thang máy Zone A. Đi trong lối chung, bên ngoài các khu kỹ thuật được đánh dấu.",
    "Check that the Zone A lift serves L3, then take it to L3. If unavailable, ask mall staff. This transfer is paired from the named areas on the plans.": "Kiểm tra thang máy Zone A có phục vụ L3, rồi đi đến L3. Nếu không sử dụng được, hãy hỏi nhân viên. Kết nối này được đối chiếu theo các khu có tên trên sơ đồ.",
    "After reaching L3, follow the marked public aisle around the service rectangle beside Zone A, toward MLB.": "Sau khi đến L3, theo lối đi chung được đánh dấu vòng quanh khu kỹ thuật hình chữ nhật cạnh Zone A, về phía MLB.",
    "Stop at the MLB area frontage. The map does not identify an exact doorway.": "Dừng trước khu MLB. Sơ đồ không xác định chính xác cửa ra vào."
  }
} as const;
