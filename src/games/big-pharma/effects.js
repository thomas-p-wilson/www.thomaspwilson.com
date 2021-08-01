// export default [
//   // CURES
  
//   // PAIN - basic boring drugs. Low contraction rate, zero cure rate.
//   {
//     "id":"painkiller",
//     "family":"pain",
//     "level":0,
//     "baseValue":105,
//     "sensitivity":2250,
//     "helpRate":100,
//     "boundary":[5,12],
//     "reaction":{"upgrade":{"machine":"evaporator","product":"migraine","conc":[7,10]}}
//   },
//     {
//     "id":"migraine",
//     "family":"pain",
//     "level":1,
//     "baseValue":178,
//     "sensitivity":2100,
//     "helpRate":100,
//     "contractionRate":{"cyclic":{"mag":200,"offset":15,"period":365}},
//     "boundary":[5,9],
//     "reaction":{"upgrade":{"machine":"agglomerator","combine":"catalyst1","product":"antiseizure","conc":[15,18]}}
//   },
//   {
//     "id":"antiseizure",
//     "family":"pain",
//     "level":2,
//     "baseValue":463,
//     "sensitivity":1050,
//     "helpRate":100,
//     "cureRate":5,
//     "boundary":[11,15],
//     "reaction":{"upgrade":{"machine":"uv_curer","combine":"catalyst3","product":"anesthetic","conc":[0,4]}}
//   },
//   {
//     "id":"anesthetic",
//     "family":"pain",
//     "level":3,
//     "helpRate":90,
//     "baseValue":979,"sensitivity":675,"boundary":[14,18]
//   },
  
//   // BLOOD - Higher contraction and cure rate. Some cross coupling.
//   {
//     "id":"hypertension",
//     "family":"blood",
//     "level":0,
//     "baseValue":107,"sensitivity":1800,"boundary":[9,13],
//     "helpRate":100,
//     "cureRate":10,
//     "reaction":{"upgrade":{"machine":"ioniser","product":"angina","conc":[0,6]}}
//   },
//   {
//     "id":"angina",
//     "family":"blood",
//     "level":1,
//     "helpRate":80,
//     "cureRate":10,
//     "contractionRate":{"follow":"hypertension"},
//     "baseValue":258,"sensitivity":1350,"boundary":[6,12],
//     "reaction":{"upgrade":{"machine":"autoclave","product":"stroke","conc":[9,14]}}
//   },
//   {
//     "id":"stroke",
//     "family":"blood",
//     "level":2,
//     "helpRate":60,
//     "cureRate":10,
//     "contractionRate":{"follow":"hypertension"},
//     "baseValue":487,"sensitivity":675,"boundary":[10,15],
//     "reaction":{"upgrade":{"machine":"chromatograph","product":"sicklecell","conc":[14,17]}}
//   },
//   {
//     "id":"sicklecell",
//     "family":"blood",
//     "level":3,
//     "helpRate":40,
//     "cureRate":5,
//     "baseValue":796,"sensitivity":375,"boundary":[13,17]
//   },
  
//   // PSYCHOLOGICAL
//   // Type 1 - antidepressant and schizo - High contraction and cure rates.
//   // Type 2 - others. Standard death rate with slightly elevated contraction and cure rates.
//   {
//     "id":"antidepressants",
//     "family":"psychological",
//     "level":0,
//     "helpRate":60,
//     "cureRate":5,
//     "sensitivity":1350,"baseValue":110,"boundary":[15,20],
//     "reaction":{"upgrade":{"combine":"catalyst1","machine":"dissolver","product":"adhd","conc":[7,11]}}
//   },
//   {
//     "id":"adhd",
//     "family":"psychological",
//     "level":1,
//     "sensitivity":1050,"baseValue":353,"boundary":[15,20],
//     "helpRate":60,
//     "cureRate":5,
//     "reaction":{"upgrade":{"combine":"catalyst2","machine":"ioniser","product":"bipoladisorder","conc":[12,14]}}
//   },
//   {
//     "id":"bipoladisorder",
//     "family":"psychological",
//     "level":2,
//     "sensitivity":675,"baseValue":641,"boundary":[15,20],
//     "helpRate":50,
//     "cureRate":5,
//     "reaction":{"upgrade":{"combine":"catalyst3","machine":"autoclave","product":"schizophrenia","conc":[13,15]}}
//   },
//   {
//     "id":"schizophrenia",
//     "family":"psychological",
//     "level":3,
//     "sensitivity":450,"baseValue":1023,"boundary":[16,20],
//     "helpRate":40,
//     "cureRate":5,
//     "reaction":{"upgrade":{"combine":"catalyst4","machine":"uv_curer","product":"alzheimers","conc":[14,16]}}
//   },
//   {
//     "id":"alzheimers",
//     "family":"psychological",
//     "level":4,
//     "helpRate":30,
//     "cureRate":5,
//     "sensitivity":900,"baseValue":1488,"boundary":[17,20]
//   },
  
//   // RELAXANTS - Very low cure rates (long term use). Medium contraction rates but higher sensitivity than pain meds. Often the target of random events.
//   {
//     "id":"antihistamine",
//     "family":"relaxants",
//     "level":0,
//     "sensitivity":2100,"baseValue":105,"boundary":[2,8],
//     "helpRate":80,
//     "contractionRate":{"cyclic":{"mag":500,"offset":197,"period":365}},
//     "reaction":{"upgrade":{"machine":"dissolver","product":"insomnia","conc":[4,6]}}
//   },
  
//   {
//     "id":"insomnia",
//     "family":"relaxants",
//     "level":1,
//     "sensitivity":1500,"baseValue":250,"boundary":[12,17],
//     "helpRate":70,
//     "cureRate":10,
//     "reaction":{"upgrade":{"combine":"catalyst2","machine":"cooler","product":"anxiety","conc":[11,14]}}
//   },
  
//   {
//     "id":"anxiety",
//     "family":"relaxants",
//     "level":2,
//     "helpRate":50,
//     "cureRate":8,
//     "sensitivity":825,"baseValue":624,"boundary":[2,6]
//   },
  
//   // LUNGS - Similar to relaxants and pain except for tuberculosis. Tuberculosis has lower value but high contraction rate proportional to demand and plenty of death rate to reduce.
//   {
//     "id":"cough",
//     "family":"lungs",
//     "level":0,
//     "sensitivity":2100,"baseValue":105,"boundary":[6,13],
//     "helpRate":90,
//     "contractionRate":{"cyclic":{"mag":250,"offset":15,"period":365}},
//     "reaction":{"upgrade":{"machine":"agglomerator","product":"asthma","conc":[8,11]}}
//   },
//   {
//     "id":"asthma",
//     "family":"lungs",
//     "level":1,
//     "sensitivity":1500,"baseValue":230,"boundary":[4,10],
//     "helpRate":80,
//     "cureRate":5,
//     "reaction":{"upgrade":{"combine":"catalyst1","machine":"dissolver","product":"bronchitis","conc":[17,20]}}
//   },
//   {
//     "id":"bronchitis",
//     "family":"lungs",
//     "level":2,
//     "sensitivity":750,"baseValue":455,"boundary":[6,11],
//     "helpRate":80,
//     "reaction":{"upgrade":{"machine":"cooler","product":"tuberculosis","conc":[9,12]}}
//   },
//   {
//     "id":"tuberculosis",
//     "family":"lungs",
//     "level":3,
//     "contractionRate":{"formula":[-2,4.5,0,0,0,0,0,-0.15]},
//     "cureRate":80,
//     "sensitivity":3000,"baseValue":520,"boundary":[1,6]
//   },
  
//   // SKIN - Somewhere between relaxants and pain meds. Slightly higher sensitivity due to western market. Acne and hairloss are cash cows which cure quickly compared to other diseases.
//   {
//     "id":"rash",
//     "family":"skin",
//     "level":0,
//     "sensitivity":1800,"baseValue":107,"boundary":[8,12],
//     "helpRate":75,
//     "cureRate":10,
//     "contractionRate":{"cyclic":{"mag":200,"offset":197,"period":365}},
//     "reaction":{"upgrade":{"combine":"catalyst1","machine":"evaporator","product":"acne","conc":[10,12]}}
//   },
//   {
//     "id":"acne",
//     "family":"skin",
//     "level":1,
//     "sensitivity":1500,"baseValue":335,"boundary":[3,8],
//     "helpRate":80,
//     "cureRate":20,
//     "reaction":{"upgrade":{"machine":"sequencer","product":"hairloss","conc":[1,5]}}
//   },
//   {
//     "id":"hairloss",
//     "family":"skin",
//     "level":2,
//     "sensitivity":900,"baseValue":628,"boundary":[10,19],
//     "helpRate":70,
//     "cureRate":20
//   },
  
//   // VIRAL - Contagious so contraction rate is proportional to demand. Cold is also cyclical.
//   {
//     "id":"cold",
//     "family":"viral",
//     "level":0,
//     "sensitivity":2250,"baseValue":105,"boundary":[3,10],
//     "helpRate":90,
//     "contractionRate":{"cyclic":{"mag":400,"offset":15,"period":365}},
//     "reaction":{"upgrade":{"machine":"agglomerator","product":"antibiotics","conc":[4,8]}}
//   },
//   {
//     "id":"antibiotics",
//     "family":"viral",
//     "level":1,
//     "sensitivity":1200,"baseValue":241,"boundary":[12,18],
//     "helpRate":60,
//     "reaction":{"upgrade":{"combine":"catalyst2","machine":"cooler","product":"antimalarial","conc":[6,11]}}
//   },
//   {
//     "id":"antimalarial",
//     "family":"viral",
//     "level":2,
//     "sensitivity":3000,"baseValue":320,"boundary":[11,16],
//     "cureRate":80,
//     "contractionRate":{"formula":[-2,4.5,0,0,0,0,0,-0.15]},
//     "reaction":{"upgrade":{"combine":"catalyst4","machine":"chromatograph","product":"aids","conc":[8,11]}}
//   },
//   {
//     "id":"aids",
//     "family":"viral",
//     "level":3,
//     "sensitivity":3000,"baseValue":709,"boundary":[12,18],
//     "helpRate":60,
//     "contractionRate":{"follow":"hiv"},
//     "reaction":{"upgrade":{"combine":"catalyst5","machine":"hadron","product":"hiv","conc":[2,3]}}
//   },
//   {
//     "id":"hiv", // Only appears once AIDS treatment is created and supplied in large quantities
//     "family":"viral",
//     "level":4,
//     "cureRate":50,
//     "contractionRate":{"start":"aids"},
//     "sensitivity":3000,"baseValue":1266,"boundary":[16,20]
//   },
  
//     // DIGESTION
//   {
//     "id":"acidreflux",
//     "family":"digestion",
//     "level":0,
//     "sensitivity":1650,"baseValue":104,"boundary":[15,19],
//     "helpRate":70,
//     "reaction":{"upgrade":{"machine":"evaporator","product":"gastroenteritis","conc":[16,18]}}
//   },
//   {
//     "id":"gastroenteritis",
//     "family":"digestion",
//     "level":1,
//     "sensitivity":1350,"baseValue":223,"boundary":[8,12],
//     "helpRate":50,
//     "reaction":{"upgrade":{"machine":"autoclave","product":"appetite","conc":[6,8]}}
//   },
//   {
//     "id":"appetite",
//     "family":"digestion",
//     "level":2,
//     "sensitivity":600,"baseValue":475,"boundary":[11,15],
//     "helpRate":30,
//     "reaction":{"upgrade":{"machine":"uv_curer","product":"boweldisease","conc":[8,10]}}
//   },
//   {
//     "id":"boweldisease",
//     "family":"digestion",
//     "level":3,
//     "sensitivity":750,"baseValue":800,"boundary":[14,18],
//     "cureRate":10
//   },
  
//   // BODY RESPONSE
//   {
//     "id":"diabetes",
//     "family":"bodyresponse",
//     "level":0,
//     "sensitivity":1200,"baseValue":109,"boundary":[1,5],
//     "helpRate":80,
//     "cureRate":1,
//     "reaction":{"upgrade":{"machine":"ioniser","product":"hyperthyroidism","conc":[10,12]}}
//   },
//   {
//     "id":"hyperthyroidism",
//     "family":"bodyresponse",
//     "level":1,
//     "sensitivity":900,"baseValue":262,"boundary":[11,15],
//     "helpRate":50,
//     "cureRate":5,
//     "reaction":{"upgrade":{"combine":"catalyst3","machine":"chromatograph","product":"cancersymptoms","conc":[1,2]}}
//   },
//   {
//     "id":"cancersymptoms",
//     "family":"bodyresponse",
//     "level":2,
//     "sensitivity":600,"baseValue":592,"boundary":[2,7],
//     "helpRate":40,
//     "contractionRate":{"follow":"cancervaccine"},
//     "reaction":{"upgrade":{"combine":"catalyst4","machine":"sequencer","product":"multiplesclerosis","conc":[19,20]}}
//   },
//   {
//     "id":"multiplesclerosis",
//     "family":"bodyresponse",
//     "level":3,
//     "sensitivity":300,"baseValue":998,"boundary":[12,15],
//     "helpRate":30,
//     "reaction":{"upgrade":{"combine":"catalyst5","machine":"hadron","product":"cancervaccine","conc":[5,6]}}
//   },
//   {
//     "id":"cancervaccine",
//     "family":"bodyresponse",
//     "level":4,
//     "sensitivity":2500,"baseValue":1474,"boundary":[16,20],
//     "cureRate":40,
//     "contractionRate":{"start":"cancersymptoms"}
//   },
  
//   // LIVER
//   {
//     "id":"gout",
//     "family":"liver",
//     "level":0,
//     "sensitivity":1350,"baseValue":107,"boundary":[5,9],
//     "helpRate":80,
//     "reaction":{"upgrade":{"combine":"catalyst1","machine":"dissolver","product":"liverdisease","conc":[6,8]}}
//   },
//   {
//     "id":"liverdisease",
//     "family":"liver",
//     "level":1,
//     "sensitivity":900,"baseValue":377,"boundary":[16,19],
//     "cureRate":30,
//     "contractionRate":{"formula":[0.8]}
//   },
  
//   // SEXUAL HEALTH
//   {
//     "id":"warts",
//     "family":"sex",
//     "level":0,
//     "sensitivity":1800,"baseValue":102,"boundary":[11,16],
//     "helpRate":75,
//     "reaction":{"upgrade":{"machine":"ioniser","product":"femalecontraceptive","conc":[13,15]}}
//   },
//   {
//     "id":"femalecontraceptive",
//     "family":"sex",
//     "level":1,
//     "sensitivity":2250,"baseValue":230,"boundary":[1,6],
//     "helpRate":100,
//     "contractionRate":{"followdown":"malecontraceptive"},
//     "reaction":{"upgrade":{"combine":"catalyst2","machine":"agglomerator","product":"erectiledysfunction","conc":[17,19]}}
//   },
//   {
//     "id":"erectiledysfunction",
//     "family":"sex",
//     "level":2,
//     "sensitivity":750,"baseValue":596,"boundary":[9,13],
//     "helpRate":60,
//     "cureRate":5,
//     "reaction":{"upgrade":{"machine":"uv_curer","product":"malecontraceptive","conc":[7,9]}}
//   },
//   {
//     "id":"malecontraceptive",
//     "family":"sex",
//     "contractionRate":{"start":"femalecontraceptive"},
//     "level":3,
//     "sensitivity":1050,"baseValue":1021,"boundary":[15,17],
//     "cureRate":50
//   },
  
//   // SIDE EFFECTS
  
//   // NUISANCES
//   {
//     "id":"narrowedpupils",
//     "level":-1,
//     "boundary":[1,8]
//   },
//      {
//      "id":"sleepiness",
//      "level":-1,
//     //"cureRate":[{"id":"insomnia","formula":[0,-1]}],
//      "boundary":[1,13],
//      "reaction":{"remove":{"machine":"ioniser","conc":[14,19]}}

//    },
//   {
//     "id":"drymouth",
//     "level":-1,
//     "boundary":[2,10]
//   },
//     {
//       "id":"constipation",
//       "level":-1,
//       "boundary":[3,11],
//       "reaction":{"remove":{"machine":"evaporator","conc":[13,17]}}
//     },
//   {
//     "id":"headaches",
//     "level":-1,
//     //"cureRate":[{"id":"migraine","formula":[0,2]}],
//     //"cureRate":[{"id":"painkiller","formula":[0,1]}],
//     "boundary":[4,12]
//   },
//   {
//       "id":"pinsandneedles",
//       "level":-1,
//       "boundary":[3,14],
//       "reaction":{"remove":{"machine":"dissolver","conc":[3,4]}}
//     },
//   {
//     "id":"nausea",
//     "level":-1,
//     "boundary":[6,14]
//   },
//   {
//       "id":"fatigue",
//       "level":-1,
//       "boundary":[5,16],
//       "reaction":{"remove":{"machine":"agglomerator","conc":[0,5]}}
//     },
//   {
//     "id":"highbloodpressure",
//     "level":-1,
//     //"cureRate":[{"id":"hypertension","formula":[0,1]}],
//     //"cureRate":[{"id":"angina","formula":[0,1]}],
//     //"cureRate":[{"id":"stroke","formula":[0,1]}],
//     "boundary":[8,16]
//   },
//   {
//     "id":"inflamesskin",
//     "level":-1,
//     //"cureRate":[{"id":"rash","formula":[0,2]}],
//     "boundary":[10,18]
//   },
//   {
//     "id":"nightmares",
//     "level":-1,
//     //"cureRate":[{"id":"insomnia","formula":[0,1]}],
//     "boundary":[12,20]
//   },
//   // CATALYST 1
//   {
//     "id":"dizziness",
//     "level":-2,
//     "catalyst":"catalyst1",
//     "boundary":[1,9],
//     "reaction":{"remove":{"machine":"ioniser","conc":[13,17]}}
//   },
//   {
//     "id":"fainting",
//     "catalyst":"catalyst1",
//     "level":-2,
//     "boundary":[2,12],
//     "reaction":{"remove":{"machine":"ioniser","conc":[12,14]}}
//   },
//   {
//     "id":"blursvision",
//     "catalyst":"catalyst1",
//     "level":-2,
//     "boundary":[3,11],
//     "reaction":{"remove":{"machine":"agglomerator","conc":[0,3]}}
//   },
//   {
//     "id":"encouragesanxiety",
//     "catalyst":"catalyst1",
//     "level":-2,
//     //"cureRate":[{"id":"anxiety","formula":[0,2]}],
//     //"cureRate":[{"id":"insomnia","formula":[0,1]}],
//     "boundary":[5,17],
//     "reaction":{"remove":{"machine":"agglomerator","conc":[1,5]}}
//   },
//   // CATALYST 2
//   {
//     "id":"urinaryretention",
//     "catalyst":"catalyst2",
//     "level":-3,
//     "boundary":[12,20],
//     "reaction":{"remove":{"machine":"cooler","conc":[5,9]}}
//   },
//   {
//     "id":"vomiting",
//     "catalyst":"catalyst2",
//     "level":-3,
//     "boundary":[1,12],
//     "reaction":{"remove":{"machine":"autoclave","conc":[13,18]}}
//   },
//   {
//     "id":"breathingdifficulties",
//     "catalyst":"catalyst2",
//     "level":-3,
//     "boundary":[6,15],
//     "reaction":{"remove":{"machine":"agglomerator","conc":[17,20]}}
//   },
//   // CATALYST 3
//   {
//     "id":"analleakage",
//     "catalyst":"catalyst3",
//     "level":-4,
//     "boundary":[1,7],
//     "reaction":{"remove":{"machine":"autoclave","conc":[10,14]}}
//   },
//   {
//     "id":"hallucinations",
//     "catalyst":"catalyst3",
//     "level":-4,
//     "boundary":[4,11],
//     "reaction":{"remove":{"machine":"uv_curer","conc":[1,20]}}
//   },
//   {
//     "id":"fits",
//     "catalyst":"catalyst3",
//     "level":-4,
//     "occurenceFactor":7,
//     "boundary":[10,17],
//     "reaction":{"remove":{"machine":"cooler","conc":[5,9]}}
//   },
//   // CATALYST 4
//   {
//     "id":"blackouts",
//     "catalyst":"catalyst4",
//     "level":-5,
//     "boundary":[6,14],
//     "reaction":{"remove":{"machine":"uv_curer","conc":[1,5]}}
//   },
//   {
//     "id":"memoryloss",
//     "catalyst":"catalyst4",
//     "level":-5,
//     "boundary":[12,20],
//     "reaction":{"remove":{"machine":"chromatograph","conc":[7,11]}}
//   },
//   {
//     "id":"carcinogenic",
//     "catalyst":"catalyst4",
//     "level":-5,
//     "boundary":[2,8],
//     "reaction":{"remove":{"machine":"cooler","conc":[13,15]}}
//   },
//   // CATALYST 5
//   {
//     "id":"paralysis",
//     "catalyst":"catalyst5",
//     "level":-6,
//     "boundary":[5,15],
//     "reaction":{"remove":{"machine":"sequencer","conc":[7,11]}}
//   }
// ]


export default [
  {
    "id": "painkiller",
    "family": "pain",
    "level": 0,
    "reaction": {
      "upgrade": {
        "machine": "evaporator",
        "product": "migraine",
        "conc": [
          7,
          10
        ]
      }
    },
    "start": 5,
    "end": 12,
    "cure": true
  },
  {
    "id": "migraine",
    "family": "pain",
    "level": 1,
    "contractionRate": {
      "cyclic": {
        "mag": 200,
        "offset": 15,
        "period": 365
      }
    },
    "reaction": {
      "upgrade": {
        "machine": "agglomerator",
        "combine": "catalyst1",
        "product": "antiseizure",
        "conc": [
          15,
          18
        ]
      }
    },
    "start": 5,
    "end": 9,
    "cure": true
  },
  {
    "id": "antiseizure",
    "family": "pain",
    "level": 2,
    "reaction": {
      "upgrade": {
        "machine": "uv_curer",
        "combine": "catalyst3",
        "product": "anesthetic",
        "conc": [
          0,
          4
        ]
      }
    },
    "start": 11,
    "end": 15,
    "cure": true
  },
  {
    "id": "anesthetic",
    "family": "pain",
    "level": 3,
    "start": 14,
    "end": 18,
    "cure": true
  },
  {
    "id": "hypertension",
    "family": "blood",
    "level": 0,
    "reaction": {
      "upgrade": {
        "machine": "ioniser",
        "product": "angina",
        "conc": [
          0,
          6
        ]
      }
    },
    "start": 9,
    "end": 13,
    "cure": true
  },
  {
    "id": "angina",
    "family": "blood",
    "level": 1,
    "contractionRate": {
      "follow": "hypertension"
    },
    "reaction": {
      "upgrade": {
        "machine": "autoclave",
        "product": "stroke",
        "conc": [
          9,
          14
        ]
      }
    },
    "start": 6,
    "end": 12,
    "cure": true
  },
  {
    "id": "stroke",
    "family": "blood",
    "level": 2,
    "contractionRate": {
      "follow": "hypertension"
    },
    "reaction": {
      "upgrade": {
        "machine": "chromatograph",
        "product": "sicklecell",
        "conc": [
          14,
          17
        ]
      }
    },
    "start": 10,
    "end": 15,
    "cure": true
  },
  {
    "id": "sicklecell",
    "family": "blood",
    "level": 3,
    "start": 13,
    "end": 17,
    "cure": true
  },
  {
    "id": "antidepressants",
    "family": "psychological",
    "level": 0,
    "reaction": {
      "upgrade": {
        "combine": "catalyst1",
        "machine": "dissolver",
        "product": "adhd",
        "conc": [
          7,
          11
        ]
      }
    },
    "start": 15,
    "end": 20,
    "cure": true
  },
  {
    "id": "adhd",
    "family": "psychological",
    "level": 1,
    "reaction": {
      "upgrade": {
        "combine": "catalyst2",
        "machine": "ioniser",
        "product": "bipoladisorder",
        "conc": [
          12,
          14
        ]
      }
    },
    "start": 15,
    "end": 20,
    "cure": true
  },
  {
    "id": "bipoladisorder",
    "family": "psychological",
    "level": 2,
    "reaction": {
      "upgrade": {
        "combine": "catalyst3",
        "machine": "autoclave",
        "product": "schizophrenia",
        "conc": [
          13,
          15
        ]
      }
    },
    "start": 15,
    "end": 20,
    "cure": true
  },
  {
    "id": "schizophrenia",
    "family": "psychological",
    "level": 3,
    "reaction": {
      "upgrade": {
        "combine": "catalyst4",
        "machine": "uv_curer",
        "product": "alzheimers",
        "conc": [
          14,
          16
        ]
      }
    },
    "start": 16,
    "end": 20,
    "cure": true
  },
  {
    "id": "alzheimers",
    "family": "psychological",
    "level": 4,
    "start": 17,
    "end": 20,
    "cure": true
  },
  {
    "id": "antihistamine",
    "family": "relaxants",
    "level": 0,
    "contractionRate": {
      "cyclic": {
        "mag": 500,
        "offset": 197,
        "period": 365
      }
    },
    "reaction": {
      "upgrade": {
        "machine": "dissolver",
        "product": "insomnia",
        "conc": [
          4,
          6
        ]
      }
    },
    "start": 2,
    "end": 8,
    "cure": true
  },
  {
    "id": "insomnia",
    "family": "relaxants",
    "level": 1,
    "reaction": {
      "upgrade": {
        "combine": "catalyst2",
        "machine": "cooler",
        "product": "anxiety",
        "conc": [
          11,
          14
        ]
      }
    },
    "start": 12,
    "end": 17,
    "cure": true
  },
  {
    "id": "anxiety",
    "family": "relaxants",
    "level": 2,
    "start": 2,
    "end": 6,
    "cure": true
  },
  {
    "id": "cough",
    "family": "lungs",
    "level": 0,
    "contractionRate": {
      "cyclic": {
        "mag": 250,
        "offset": 15,
        "period": 365
      }
    },
    "reaction": {
      "upgrade": {
        "machine": "agglomerator",
        "product": "asthma",
        "conc": [
          8,
          11
        ]
      }
    },
    "start": 6,
    "end": 13,
    "cure": true
  },
  {
    "id": "asthma",
    "family": "lungs",
    "level": 1,
    "reaction": {
      "upgrade": {
        "combine": "catalyst1",
        "machine": "dissolver",
        "product": "bronchitis",
        "conc": [
          17,
          20
        ]
      }
    },
    "start": 4,
    "end": 10,
    "cure": true
  },
  {
    "id": "bronchitis",
    "family": "lungs",
    "level": 2,
    "reaction": {
      "upgrade": {
        "machine": "cooler",
        "product": "tuberculosis",
        "conc": [
          9,
          12
        ]
      }
    },
    "start": 6,
    "end": 11,
    "cure": true
  },
  {
    "id": "tuberculosis",
    "family": "lungs",
    "level": 3,
    "contractionRate": {
      "formula": [
        -2,
        4.5,
        0,
        0,
        0,
        0,
        0,
        -0.15
      ]
    },
    "start": 1,
    "end": 6,
    "cure": true
  },
  {
    "id": "rash",
    "family": "skin",
    "level": 0,
    "contractionRate": {
      "cyclic": {
        "mag": 200,
        "offset": 197,
        "period": 365
      }
    },
    "reaction": {
      "upgrade": {
        "combine": "catalyst1",
        "machine": "evaporator",
        "product": "acne",
        "conc": [
          10,
          12
        ]
      }
    },
    "start": 8,
    "end": 12,
    "cure": true
  },
  {
    "id": "acne",
    "family": "skin",
    "level": 1,
    "reaction": {
      "upgrade": {
        "machine": "sequencer",
        "product": "hairloss",
        "conc": [
          1,
          5
        ]
      }
    },
    "start": 3,
    "end": 8,
    "cure": true
  },
  {
    "id": "hairloss",
    "family": "skin",
    "level": 2,
    "start": 10,
    "end": 19,
    "cure": true
  },
  {
    "id": "cold",
    "family": "viral",
    "level": 0,
    "contractionRate": {
      "cyclic": {
        "mag": 400,
        "offset": 15,
        "period": 365
      }
    },
    "reaction": {
      "upgrade": {
        "machine": "agglomerator",
        "product": "antibiotics",
        "conc": [
          4,
          8
        ]
      }
    },
    "start": 3,
    "end": 10,
    "cure": true
  },
  {
    "id": "antibiotics",
    "family": "viral",
    "level": 1,
    "reaction": {
      "upgrade": {
        "combine": "catalyst2",
        "machine": "cooler",
        "product": "antimalarial",
        "conc": [
          6,
          11
        ]
      }
    },
    "start": 12,
    "end": 18,
    "cure": true
  },
  {
    "id": "antimalarial",
    "family": "viral",
    "level": 2,
    "contractionRate": {
      "formula": [
        -2,
        4.5,
        0,
        0,
        0,
        0,
        0,
        -0.15
      ]
    },
    "reaction": {
      "upgrade": {
        "combine": "catalyst4",
        "machine": "chromatograph",
        "product": "aids",
        "conc": [
          8,
          11
        ]
      }
    },
    "start": 11,
    "end": 16,
    "cure": true
  },
  {
    "id": "aids",
    "family": "viral",
    "level": 3,
    "contractionRate": {
      "follow": "hiv"
    },
    "reaction": {
      "upgrade": {
        "combine": "catalyst5",
        "machine": "hadron",
        "product": "hiv",
        "conc": [
          2,
          3
        ]
      }
    },
    "start": 12,
    "end": 18,
    "cure": true
  },
  {
    "id": "hiv",
    "family": "viral",
    "level": 4,
    "contractionRate": {
      "start": "aids"
    },
    "start": 16,
    "end": 20,
    "cure": true
  },
  {
    "id": "acidreflux",
    "family": "digestion",
    "level": 0,
    "reaction": {
      "upgrade": {
        "machine": "evaporator",
        "product": "gastroenteritis",
        "conc": [
          16,
          18
        ]
      }
    },
    "start": 15,
    "end": 19,
    "cure": true
  },
  {
    "id": "gastroenteritis",
    "family": "digestion",
    "level": 1,
    "reaction": {
      "upgrade": {
        "machine": "autoclave",
        "product": "appetite",
        "conc": [
          6,
          8
        ]
      }
    },
    "start": 8,
    "end": 12,
    "cure": true
  },
  {
    "id": "appetite",
    "family": "digestion",
    "level": 2,
    "reaction": {
      "upgrade": {
        "machine": "uv_curer",
        "product": "boweldisease",
        "conc": [
          8,
          10
        ]
      }
    },
    "start": 11,
    "end": 15,
    "cure": true
  },
  {
    "id": "boweldisease",
    "family": "digestion",
    "level": 3,
    "start": 14,
    "end": 18,
    "cure": true
  },
  {
    "id": "diabetes",
    "family": "bodyresponse",
    "level": 0,
    "reaction": {
      "upgrade": {
        "machine": "ioniser",
        "product": "hyperthyroidism",
        "conc": [
          10,
          12
        ]
      }
    },
    "start": 1,
    "end": 5,
    "cure": true
  },
  {
    "id": "hyperthyroidism",
    "family": "bodyresponse",
    "level": 1,
    "reaction": {
      "upgrade": {
        "combine": "catalyst3",
        "machine": "chromatograph",
        "product": "cancersymptoms",
        "conc": [
          1,
          2
        ]
      }
    },
    "start": 11,
    "end": 15,
    "cure": true
  },
  {
    "id": "cancersymptoms",
    "family": "bodyresponse",
    "level": 2,
    "contractionRate": {
      "follow": "cancervaccine"
    },
    "reaction": {
      "upgrade": {
        "combine": "catalyst4",
        "machine": "sequencer",
        "product": "multiplesclerosis",
        "conc": [
          19,
          20
        ]
      }
    },
    "start": 2,
    "end": 7,
    "cure": true
  },
  {
    "id": "multiplesclerosis",
    "family": "bodyresponse",
    "level": 3,
    "reaction": {
      "upgrade": {
        "combine": "catalyst5",
        "machine": "hadron",
        "product": "cancervaccine",
        "conc": [
          5,
          6
        ]
      }
    },
    "start": 12,
    "end": 15,
    "cure": true
  },
  {
    "id": "cancervaccine",
    "family": "bodyresponse",
    "level": 4,
    "contractionRate": {
      "start": "cancersymptoms"
    },
    "start": 16,
    "end": 20,
    "cure": true
  },
  {
    "id": "gout",
    "family": "liver",
    "level": 0,
    "reaction": {
      "upgrade": {
        "combine": "catalyst1",
        "machine": "dissolver",
        "product": "liverdisease",
        "conc": [
          6,
          8
        ]
      }
    },
    "start": 5,
    "end": 9,
    "cure": true
  },
  {
    "id": "liverdisease",
    "family": "liver",
    "level": 1,
    "contractionRate": {
      "formula": [
        0.8
      ]
    },
    "start": 16,
    "end": 19,
    "cure": true
  },
  {
    "id": "warts",
    "family": "sex",
    "level": 0,
    "reaction": {
      "upgrade": {
        "machine": "ioniser",
        "product": "femalecontraceptive",
        "conc": [
          13,
          15
        ]
      }
    },
    "start": 11,
    "end": 16,
    "cure": true
  },
  {
    "id": "femalecontraceptive",
    "family": "sex",
    "level": 1,
    "contractionRate": {
      "followdown": "malecontraceptive"
    },
    "reaction": {
      "upgrade": {
        "combine": "catalyst2",
        "machine": "agglomerator",
        "product": "erectiledysfunction",
        "conc": [
          17,
          19
        ]
      }
    },
    "start": 1,
    "end": 6,
    "cure": true
  },
  {
    "id": "erectiledysfunction",
    "family": "sex",
    "level": 2,
    "reaction": {
      "upgrade": {
        "machine": "uv_curer",
        "product": "malecontraceptive",
        "conc": [
          7,
          9
        ]
      }
    },
    "start": 9,
    "end": 13,
    "cure": true
  },
  {
    "id": "malecontraceptive",
    "family": "sex",
    "contractionRate": {
      "start": "femalecontraceptive"
    },
    "level": 3,
    "start": 15,
    "end": 17,
    "cure": true
  },
  {
    "id": "narrowedpupils",
    "level": -1,
    "start": 1,
    "end": 8,
    "cure": false
  },
  {
    "id": "sleepiness",
    "level": -1,
    "reaction": {
      "remove": {
        "machine": "ioniser",
        "conc": [
          14,
          19
        ]
      }
    },
    "start": 1,
    "end": 13,
    "cure": false
  },
  {
    "id": "drymouth",
    "level": -1,
    "start": 2,
    "end": 10,
    "cure": false
  },
  {
    "id": "constipation",
    "level": -1,
    "reaction": {
      "remove": {
        "machine": "evaporator",
        "conc": [
          13,
          17
        ]
      }
    },
    "start": 3,
    "end": 11,
    "cure": false
  },
  {
    "id": "headaches",
    "level": -1,
    "start": 4,
    "end": 12,
    "cure": false
  },
  {
    "id": "pinsandneedles",
    "level": -1,
    "reaction": {
      "remove": {
        "machine": "dissolver",
        "conc": [
          3,
          4
        ]
      }
    },
    "start": 3,
    "end": 14,
    "cure": false
  },
  {
    "id": "nausea",
    "level": -1,
    "start": 6,
    "end": 14,
    "cure": false
  },
  {
    "id": "fatigue",
    "level": -1,
    "reaction": {
      "remove": {
        "machine": "agglomerator",
        "conc": [
          0,
          5
        ]
      }
    },
    "start": 5,
    "end": 16,
    "cure": false
  },
  {
    "id": "highbloodpressure",
    "level": -1,
    "start": 8,
    "end": 16,
    "cure": false
  },
  {
    "id": "inflamesskin",
    "level": -1,
    "start": 10,
    "end": 18,
    "cure": false
  },
  {
    "id": "nightmares",
    "level": -1,
    "start": 12,
    "end": 20,
    "cure": false
  },
  {
    "id": "dizziness",
    "level": -2,
    "catalyst": "catalyst1",
    "reaction": {
      "remove": {
        "machine": "ioniser",
        "conc": [
          13,
          17
        ]
      }
    },
    "start": 1,
    "end": 9,
    "cure": false
  },
  {
    "id": "fainting",
    "catalyst": "catalyst1",
    "level": -2,
    "reaction": {
      "remove": {
        "machine": "ioniser",
        "conc": [
          12,
          14
        ]
      }
    },
    "start": 2,
    "end": 12,
    "cure": false
  },
  {
    "id": "blursvision",
    "catalyst": "catalyst1",
    "level": -2,
    "reaction": {
      "remove": {
        "machine": "agglomerator",
        "conc": [
          0,
          3
        ]
      }
    },
    "start": 3,
    "end": 11,
    "cure": false
  },
  {
    "id": "encouragesanxiety",
    "catalyst": "catalyst1",
    "level": -2,
    "reaction": {
      "remove": {
        "machine": "agglomerator",
        "conc": [
          1,
          5
        ]
      }
    },
    "start": 5,
    "end": 17,
    "cure": false
  },
  {
    "id": "urinaryretention",
    "catalyst": "catalyst2",
    "level": -3,
    "reaction": {
      "remove": {
        "machine": "cooler",
        "conc": [
          5,
          9
        ]
      }
    },
    "start": 12,
    "end": 20,
    "cure": false
  },
  {
    "id": "vomiting",
    "catalyst": "catalyst2",
    "level": -3,
    "reaction": {
      "remove": {
        "machine": "autoclave",
        "conc": [
          13,
          18
        ]
      }
    },
    "start": 1,
    "end": 12,
    "cure": false
  },
  {
    "id": "breathingdifficulties",
    "catalyst": "catalyst2",
    "level": -3,
    "reaction": {
      "remove": {
        "machine": "agglomerator",
        "conc": [
          17,
          20
        ]
      }
    },
    "start": 6,
    "end": 15,
    "cure": false
  },
  {
    "id": "analleakage",
    "catalyst": "catalyst3",
    "level": -4,
    "reaction": {
      "remove": {
        "machine": "autoclave",
        "conc": [
          10,
          14
        ]
      }
    },
    "start": 1,
    "end": 7,
    "cure": false
  },
  {
    "id": "hallucinations",
    "catalyst": "catalyst3",
    "level": -4,
    "reaction": {
      "remove": {
        "machine": "uv_curer",
        "conc": [
          1,
          20
        ]
      }
    },
    "start": 4,
    "end": 11,
    "cure": false
  },
  {
    "id": "fits",
    "catalyst": "catalyst3",
    "level": -4,
    "occurenceFactor": 7,
    "reaction": {
      "remove": {
        "machine": "cooler",
        "conc": [
          5,
          9
        ]
      }
    },
    "start": 10,
    "end": 17,
    "cure": false
  },
  {
    "id": "blackouts",
    "catalyst": "catalyst4",
    "level": -5,
    "reaction": {
      "remove": {
        "machine": "uv_curer",
        "conc": [
          1,
          5
        ]
      }
    },
    "start": 6,
    "end": 14,
    "cure": false
  },
  {
    "id": "memoryloss",
    "catalyst": "catalyst4",
    "level": -5,
    "reaction": {
      "remove": {
        "machine": "chromatograph",
        "conc": [
          7,
          11
        ]
      }
    },
    "start": 12,
    "end": 20,
    "cure": false
  },
  {
    "id": "carcinogenic",
    "catalyst": "catalyst4",
    "level": -5,
    "reaction": {
      "remove": {
        "machine": "cooler",
        "conc": [
          13,
          15
        ]
      }
    },
    "start": 2,
    "end": 8,
    "cure": false
  },
  {
    "id": "paralysis",
    "catalyst": "catalyst5",
    "level": -6,
    "reaction": {
      "remove": {
        "machine": "sequencer",
        "conc": [
          7,
          11
        ]
      }
    },
    "start": 5,
    "end": 15,
    "cure": false
  }
]
