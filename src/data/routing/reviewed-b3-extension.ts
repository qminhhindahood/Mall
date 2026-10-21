// Explicit accepted r7 directions; never synthesize reverse text or tenant-boundary paths.
export const reviewedB3Extension = {
  "revision": "reviewed-b3-r7-integrated-r8",
  "source": "ccf11fc15fc9f6efa32ca8a23b395caba1a0e2f248740c0ee0d9c2c6c5e12e89",
  "reviewEvidence": "evidence/integrated-mapping-r7/pending-b3-network/review.json",
  "instructionEvidence": "evidence/integrated-mapping-r7/pending-b3-network/instruction-review.json",
  "nodes": [
    {
      "id": "b3-13-east-aisle",
      "point": [
        405,
        507
      ]
    },
    {
      "id": "b3-13-east-frontage",
      "point": [
        405,
        480
      ]
    },
    {
      "id": "central-cross-aisle",
      "point": [
        405,
        454
      ]
    },
    {
      "id": "east-cross-aisle",
      "point": [
        594,
        454
      ]
    },
    {
      "id": "san-fu-lou-frontage",
      "point": [
        594,
        330
      ]
    },
    {
      "id": "upper-east-junction",
      "point": [
        594,
        267
      ]
    },
    {
      "id": "manwah-frontage",
      "point": [
        470,
        267
      ]
    },
    {
      "id": "gogi-frontage",
      "point": [
        310,
        267
      ]
    },
    {
      "id": "kichi-north-junction",
      "point": [
        615,
        454
      ]
    },
    {
      "id": "kichi-frontage",
      "point": [
        615,
        525
      ]
    }
  ],
  "arcs": [
    {
      "id": "E1:forward",
      "from": "b3-13-east-aisle",
      "to": "b3-13-east-frontage",
      "instruction": {
        "en": "Follow the public aisle upward on the map to the side of B3-13.",
        "vi": "Theo lối đi chung lên phía trên sơ đồ đến cạnh B3-13."
      }
    },
    {
      "id": "E1:reverse",
      "from": "b3-13-east-frontage",
      "to": "b3-13-east-aisle",
      "instruction": {
        "en": "Follow the public aisle downward on the map to the side of the escalator beside B3-13.",
        "vi": "Theo lối đi chung xuống phía dưới sơ đồ đến cạnh thang cuốn bên B3-13."
      }
    },
    {
      "id": "E2:forward",
      "from": "b3-13-east-frontage",
      "to": "central-cross-aisle",
      "instruction": {
        "en": "Continue upward on the map to the crossing aisle above B3-13.",
        "vi": "Đi tiếp lên phía trên sơ đồ đến lối đi ngang phía trên B3-13."
      }
    },
    {
      "id": "E2:reverse",
      "from": "central-cross-aisle",
      "to": "b3-13-east-frontage",
      "instruction": {
        "en": "Follow the aisle downward on the map to the side of B3-13.",
        "vi": "Theo lối đi xuống phía dưới sơ đồ đến cạnh B3-13."
      }
    },
    {
      "id": "E3:forward",
      "from": "central-cross-aisle",
      "to": "east-cross-aisle",
      "instruction": {
        "en": "Follow the crossing aisle rightward on the map, below B3-20, B3-27 and B3-28B.",
        "vi": "Theo lối đi ngang sang phải trên sơ đồ, phía dưới B3-20, B3-27 và B3-28B."
      }
    },
    {
      "id": "E3:reverse",
      "from": "east-cross-aisle",
      "to": "central-cross-aisle",
      "instruction": {
        "en": "Follow the crossing aisle leftward on the map, below B3-28B, B3-27 and B3-20.",
        "vi": "Theo lối đi ngang sang trái trên sơ đồ, phía dưới B3-28B, B3-27 và B3-20."
      }
    },
    {
      "id": "E4:forward",
      "from": "east-cross-aisle",
      "to": "san-fu-lou-frontage",
      "instruction": {
        "en": "Follow the aisle upward on the map beside B3-28B and B3-28A, toward the San Fu Lou area frontage.",
        "vi": "Theo lối đi lên phía trên sơ đồ bên cạnh B3-28B và B3-28A, về phía trước khu San Fu Lou."
      }
    },
    {
      "id": "E4:reverse",
      "from": "san-fu-lou-frontage",
      "to": "east-cross-aisle",
      "instruction": {
        "en": "Follow the aisle downward on the map beside B3-28A and B3-28B to the crossing aisle.",
        "vi": "Theo lối đi xuống phía dưới sơ đồ bên cạnh B3-28A và B3-28B đến lối đi ngang."
      }
    },
    {
      "id": "E5:forward",
      "from": "san-fu-lou-frontage",
      "to": "upper-east-junction",
      "instruction": {
        "en": "Continue upward on the map beside B3-28A to the aisle below B3-28C.",
        "vi": "Đi tiếp lên phía trên sơ đồ bên cạnh B3-28A đến lối đi phía dưới B3-28C."
      }
    },
    {
      "id": "E5:reverse",
      "from": "upper-east-junction",
      "to": "san-fu-lou-frontage",
      "instruction": {
        "en": "Follow the aisle downward on the map beside B3-28A, toward the San Fu Lou area frontage.",
        "vi": "Theo lối đi xuống phía dưới sơ đồ bên cạnh B3-28A, về phía trước khu San Fu Lou."
      }
    },
    {
      "id": "E6:forward",
      "from": "upper-east-junction",
      "to": "manwah-frontage",
      "instruction": {
        "en": "Follow the aisle leftward on the map below B3-28C, toward the Manwah area frontage.",
        "vi": "Theo lối đi sang trái trên sơ đồ phía dưới B3-28C, về phía trước khu Manwah."
      }
    },
    {
      "id": "E6:reverse",
      "from": "manwah-frontage",
      "to": "upper-east-junction",
      "instruction": {
        "en": "Follow the aisle rightward on the map below B3-28C to the aisle junction.",
        "vi": "Theo lối đi sang phải trên sơ đồ phía dưới B3-28C đến giao lối đi."
      }
    },
    {
      "id": "E7:forward",
      "from": "manwah-frontage",
      "to": "gogi-frontage",
      "instruction": {
        "en": "Continue leftward on the map along the aisle below B3-23-24, toward the GoGi House area frontage.",
        "vi": "Đi tiếp sang trái trên sơ đồ theo lối đi phía dưới B3-23-24, về phía trước khu GoGi House."
      }
    },
    {
      "id": "E7:reverse",
      "from": "gogi-frontage",
      "to": "manwah-frontage",
      "instruction": {
        "en": "Follow the aisle rightward on the map below B3-23-24 and B3-28C, toward the Manwah area frontage.",
        "vi": "Theo lối đi sang phải trên sơ đồ phía dưới B3-23-24 và B3-28C, về phía trước khu Manwah."
      }
    },
    {
      "id": "E8:forward",
      "from": "east-cross-aisle",
      "to": "kichi-north-junction",
      "instruction": {
        "en": "Follow the short crossing aisle rightward on the map to the passage beside B3-17.",
        "vi": "Theo đoạn lối đi ngang ngắn sang phải trên sơ đồ đến lối đi bên cạnh B3-17."
      }
    },
    {
      "id": "E8:reverse",
      "from": "kichi-north-junction",
      "to": "east-cross-aisle",
      "instruction": {
        "en": "Follow the short crossing aisle leftward on the map to the junction beside B3-28B.",
        "vi": "Theo đoạn lối đi ngang ngắn sang trái trên sơ đồ đến giao lối đi bên cạnh B3-28B."
      }
    },
    {
      "id": "E9:forward",
      "from": "kichi-north-junction",
      "to": "kichi-frontage",
      "instruction": {
        "en": "Follow the aisle downward on the map between B3-16A and B3-17, toward the Kichi-Kichi area frontage.",
        "vi": "Theo lối đi xuống phía dưới sơ đồ giữa B3-16A và B3-17, về phía trước khu Kichi-Kichi."
      }
    },
    {
      "id": "E9:reverse",
      "from": "kichi-frontage",
      "to": "kichi-north-junction",
      "instruction": {
        "en": "Follow the aisle upward on the map between B3-17 and B3-16A to the crossing aisle.",
        "vi": "Theo lối đi lên phía trên sơ đồ giữa B3-17 và B3-16A đến lối đi ngang."
      }
    }
  ],
  "anchors": [
    {
      "destinationId": "vincom-prototype-gogihouse",
      "areaId": "derived-r7-gogihouse-area",
      "node": "gogi-frontage"
    },
    {
      "destinationId": "vincom-prototype-manwah",
      "areaId": "derived-r7-manwah-area",
      "node": "manwah-frontage"
    },
    {
      "destinationId": "vincom-prototype-sanfulou",
      "areaId": "derived-r7-sanfulou-area",
      "node": "san-fu-lou-frontage"
    },
    {
      "destinationId": "vincom-prototype-kichikichi",
      "areaId": "derived-r7-kichikichi-area",
      "node": "kichi-frontage"
    }
  ]
};
