module.exports = [
    {
        "test": {
            "type": "balance",
            "workers": 1,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 1
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.006,
                "complete": 1,
                "failed": 0,
                "requestsPerSecond": 166.67,
                "timePerRequest": 6,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"02ccf870-af3e-11e7-a498-17db0f180682\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            }
        ]
    },
    {
        "test": {
            "type": "balance",
            "workers": 1,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 10
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.037,
                "complete": 10,
                "failed": 0,
                "requestsPerSecond": 270.27,
                "timePerRequest": 3.7,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"03b70a50-af3e-11e7-8dee-89ec1bc20977\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            }
        ]
    },
    {
        "test": {
            "type": "balance",
            "workers": 1,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.321,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 311.53,
                "timePerRequest": 3.21,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"049f6e80-af3e-11e7-aeed-5908056f77e7\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            }
        ]
    },
    {
        "test": {
            "type": "balance",
            "workers": 4,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.281,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 355.87,
                "timePerRequest": 2.81,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"05b54b50-af3e-11e7-bbd5-85a10f88c606\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            },
            {
                "worker": "performance-2.cot.primer.XXX#1",
                "totalTime": 0.255,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 392.16,
                "timePerRequest": 2.55,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"05c020c0-af3e-11e7-8f7c-fdc8e54d6944\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            },
            {
                "worker": "performance-3.cot.primer.XXX#2",
                "totalTime": 0.258,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 387.6,
                "timePerRequest": 2.58,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"05bdd6d0-af3e-11e7-99c1-b1d6a3fb68d7\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            },
            {
                "worker": "performance-4.cot.primer.XXX#3",
                "totalTime": 0.253,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 395.26,
                "timePerRequest": 2.53,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"05c1ce70-af3e-11e7-af19-2d5860ed5d55\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            }
        ]
    },
    {
        "test": {
            "type": "balance",
            "workers": 4,
            "concurrency": 5,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.059,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 1694.92,
                "timePerRequest": 0.59,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"06cb9d50-af3e-11e7-a1cc-173d5a1ab214\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            },
            {
                "worker": "performance-3.cot.primer.XXX#1",
                "totalTime": 0.053,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 1886.79,
                "timePerRequest": 0.53,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"06cb9d50-af3e-11e7-ae83-57b58850cf3a\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            },
            {
                "worker": "performance-4.cot.primer.XXX#2",
                "totalTime": 0.061,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 1639.34,
                "timePerRequest": 0.61,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"06cada00-af3e-11e7-9118-4d644a6fc1d4\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            },
            {
                "worker": "performance-2.cot.primer.XXX#3",
                "totalTime": 0.054,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 1851.85,
                "timePerRequest": 0.54,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"06cb7640-af3e-11e7-958d-53672ae0af4e\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            }
        ]
    },
    {
        "test": {
            "type": "balance",
            "workers": 4,
            "concurrency": 5,
            "keep_alive": 5,
            "requestsPerWorker": 1000
        },
        "result": [
            {
                "worker": "performance-2.cot.primer.XXX#0",
                "totalTime": 0.642,
                "complete": 1000,
                "failed": 0,
                "requestsPerSecond": 1557.63,
                "timePerRequest": 0.642,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"07cb5a10-af3e-11e7-8ed0-41f8d96de8cd\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            },
            {
                "worker": "performance-3.cot.primer.XXX#1",
                "totalTime": 0.647,
                "complete": 1000,
                "failed": 0,
                "requestsPerSecond": 1545.6,
                "timePerRequest": 0.647,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"07cb3300-af3e-11e7-ac52-07fea1ca4369\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            },
            {
                "worker": "performance-1.cot.primer.XXX#2",
                "totalTime": 0.646,
                "complete": 1000,
                "failed": 0,
                "requestsPerSecond": 1547.99,
                "timePerRequest": 0.646,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"07cc6b80-af3e-11e7-9051-1712dd915516\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            },
            {
                "worker": "performance-4.cot.primer.XXX#3",
                "totalTime": 0.659,
                "complete": 1000,
                "failed": 0,
                "requestsPerSecond": 1517.45,
                "timePerRequest": 0.659,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"07cb5a10-af3e-11e7-ba99-7154896f46e4\",\"type\":\"balance\",\"body\":{\"current\":1000000,\"available\":1000000,\"spendingLimit\":0}}"
            }
        ]
    },
    {
        "test": {
            "type": "trx",
            "workers": 1,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 1
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.477,
                "complete": 1,
                "failed": 0,
                "requestsPerSecond": 2.1,
                "timePerRequest": 477,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"091fed90-af3e-11e7-8f7a-db5e11c33c0e\",\"type\":\"trx\",\"body\":{\"availableChange\":1,\"processedAt\":1507806663649,\"availableBalance\":999999,\"currentBalance\":999999,\"currentChange\":1}}"
            }
        ]
    },
    {
        "test": {
            "type": "trx",
            "workers": 1,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 10
        },
        "result": [
            {
                "worker": "performance-2.cot.primer.XXX#0",
                "totalTime": 6.256,
                "complete": 10,
                "failed": 0,
                "requestsPerSecond": 1.6,
                "timePerRequest": 625.6,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"0a4840f0-af3e-11e7-9837-353c9307066e\",\"type\":\"trx\",\"body\":{\"availableChange\":1,\"processedAt\":1507806665574,\"availableBalance\":999998,\"currentBalance\":999998,\"currentChange\":1}}"
            }
        ]
    },
    {
        "test": {
            "type": "trx",
            "workers": 1,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 52.92,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 1.89,
                "timePerRequest": 529.2,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"0ef0e170-af3e-11e7-9e7c-17876dd2bfaa\",\"type\":\"trx\",\"body\":{\"availableChange\":1,\"processedAt\":1507806673502,\"availableBalance\":999988,\"currentBalance\":999988,\"currentChange\":1}}"
            }
        ]
    },
    {
        "test": {
            "type": "trx",
            "workers": 4,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 140.934,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 0.71,
                "timePerRequest": 1409.34,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"2f5d3440-af3e-11e7-a972-c102492a4933\",\"type\":\"trx\",\"body\":{\"availableChange\":1,\"processedAt\":1507806728090,\"availableBalance\":999885,\"currentBalance\":999885,\"currentChange\":1}}"
            },
            {
                "worker": "performance-3.cot.primer.XXX#1",
                "totalTime": 140.828,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 0.71,
                "timePerRequest": 1408.28,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"2f5da970-af3e-11e7-bf41-f788e8e55b19\",\"type\":\"trx\",\"body\":{\"availableChange\":1,\"processedAt\":1507806728118,\"availableBalance\":999884,\"currentBalance\":999885,\"currentChange\":1}}"
            },
            {
                "worker": "performance-2.cot.primer.XXX#2",
                "totalTime": 140.221,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 0.71,
                "timePerRequest": 1402.21,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"2f6809b0-af3e-11e7-a8c6-abc70930ff25\",\"type\":\"trx\",\"body\":{\"availableChange\":1,\"processedAt\":1507806728404,\"availableBalance\":999883,\"currentBalance\":999885,\"currentChange\":1}}"
            },
            {
                "worker": "performance-4.cot.primer.XXX#3",
                "totalTime": 140.386,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 0.71,
                "timePerRequest": 1403.86,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"2f67bb90-af3e-11e7-b180-6f628e140180\",\"type\":\"trx\",\"body\":{\"availableChange\":1,\"processedAt\":1507806728410,\"availableBalance\":999882,\"currentBalance\":999885,\"currentChange\":1}}"
            }
        ]
    },
    {
        "test": {
            "type": "trx",
            "workers": 4,
            "concurrency": 5,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 100.049,
                "complete": 3,
                "failed": 97,
                "requestsPerSecond": 1,
                "timePerRequest": 1000.49,
                "writeErrors": "{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}",
                "firstResponse": "{\"id\":\"8443d2c0-af3e-11e7-8ca0-c9f24d59c152\",\"type\":\"trx\",\"body\":{\"availableChange\":1,\"processedAt\":1507806871128,\"availableBalance\":999467,\"currentBalance\":999469,\"currentChange\":1}}"
            },
            {
                "worker": "performance-3.cot.primer.XXX#1",
                "totalTime": 100.044,
                "complete": 2,
                "failed": 98,
                "requestsPerSecond": 1,
                "timePerRequest": 1000.44,
                "writeErrors": "{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}",
                "firstResponse": "{\"id\":\"84488db0-af3e-11e7-a299-f587fead74e8\",\"type\":\"trx\",\"error\":{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}"
            },
            {
                "worker": "performance-4.cot.primer.XXX#2",
                "totalTime": 99.798,
                "complete": 5,
                "failed": 95,
                "requestsPerSecond": 1,
                "timePerRequest": 997.98,
                "writeErrors": "{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}",
                "firstResponse": "{\"id\":\"8444e430-af3e-11e7-ae29-bbf8a046f1f9\",\"type\":\"trx\",\"body\":{\"availableChange\":1,\"processedAt\":1507806871710,\"availableBalance\":999464,\"currentBalance\":999469,\"currentChange\":1}}"
            },
            {
                "worker": "performance-2.cot.primer.XXX#3",
                "totalTime": 100.054,
                "complete": 0,
                "failed": 100,
                "requestsPerSecond": 1,
                "timePerRequest": 1000.54,
                "writeErrors": "{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}",
                "firstResponse": "{\"id\":\"846898d0-af3e-11e7-a569-ed148d0c9b4e\",\"type\":\"trx\",\"error\":{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}"
            }
        ]
    },
    {
        "test": {
            "type": "trx",
            "workers": 4,
            "concurrency": 5,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-2.cot.primer.XXX#0",
                "totalTime": 100.05,
                "complete": 3,
                "failed": 97,
                "requestsPerSecond": 1,
                "timePerRequest": 1000.5,
                "writeErrors": "{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}",
                "firstResponse": "{\"id\":\"c0f8e660-af3e-11e7-bb2c-b559d08cac15\",\"type\":\"trx\",\"error\":{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}"
            },
            {
                "worker": "performance-3.cot.primer.XXX#1",
                "totalTime": 100.048,
                "complete": 7,
                "failed": 93,
                "requestsPerSecond": 1,
                "timePerRequest": 1000.48,
                "writeErrors": "{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}",
                "firstResponse": "{\"id\":\"c100fcb0-af3e-11e7-b0c7-9fccb2854708\",\"type\":\"trx\",\"error\":{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}"
            },
            {
                "worker": "performance-4.cot.primer.XXX#2",
                "totalTime": 100.05,
                "complete": 2,
                "failed": 98,
                "requestsPerSecond": 1,
                "timePerRequest": 1000.5,
                "writeErrors": "{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}",
                "firstResponse": "{\"id\":\"c0fb0940-af3e-11e7-9cdc-27a2a4f33090\",\"type\":\"trx\",\"error\":{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}"
            },
            {
                "worker": "performance-1.cot.primer.XXX#3",
                "totalTime": 100.04,
                "complete": 4,
                "failed": 96,
                "requestsPerSecond": 1,
                "timePerRequest": 1000.4,
                "writeErrors": "{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}",
                "firstResponse": "{\"id\":\"c0f84a20-af3e-11e7-ac49-11b51c404099\",\"type\":\"trx\",\"error\":{\"status\":\"unknown\",\"message\":\"failed after 1 attempts(time spent 5000 millis)\"}}"
            }
        ]
    },
    {
        "test": {
            "type": "history",
            "workers": 1,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 1
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.008,
                "complete": 1,
                "failed": 0,
                "requestsPerSecond": 125,
                "timePerRequest": 8,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"fd8eb230-af3e-11e7-a15f-b9f99ccf5659\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807069067,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f953eeb0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807068964,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f95945e0-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807068709,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9376600-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807066367,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a48620-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065924,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a6d010-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065881,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a6a901-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065682,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a4ad30-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065544,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a6d011-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065329,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a6f720-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065277,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6ac9c70-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807064948}}"
            }
        ]
    },
    {
        "test": {
            "type": "history",
            "workers": 1,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 10
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.048,
                "complete": 10,
                "failed": 0,
                "requestsPerSecond": 208.33,
                "timePerRequest": 4.8,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"fe717110-af3e-11e7-91a6-931398b12038\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807069067,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f953eeb0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807068964,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f95945e0-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807068709,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9376600-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807066367,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a48620-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065924,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a6d010-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065881,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a6a901-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065682,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a4ad30-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065544,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a6d011-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065329,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6a6f720-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807065277,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f6ac9c70-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807064948}}"
            }
        ]
    },
    {
        "test": {
            "type": "history",
            "workers": 1,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.446,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 224.22,
                "timePerRequest": 4.46,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"ff53bac0-af3e-11e7-99e3-6b0a32faa3f2\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f98f4a00-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069619}}"
            }
        ]
    },
    {
        "test": {
            "type": "history",
            "workers": 4,
            "concurrency": 1,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-3.cot.primer.XXX#0",
                "totalTime": 0.359,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 278.55,
                "timePerRequest": 3.59,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"007c3530-af3f-11e7-9ae9-ed4abf56e037\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f98f4a00-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069619}}"
            },
            {
                "worker": "performance-4.cot.primer.XXX#1",
                "totalTime": 0.355,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 281.69,
                "timePerRequest": 3.55,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"007f4270-af3f-11e7-81f6-31e5c9182a8d\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f98f4a00-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069619}}"
            },
            {
                "worker": "performance-2.cot.primer.XXX#2",
                "totalTime": 0.36,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 277.78,
                "timePerRequest": 3.6,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"0082c4e0-af3f-11e7-9152-61d4caac7691\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f98f4a00-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069619}}"
            },
            {
                "worker": "performance-1.cot.primer.XXX#3",
                "totalTime": 0.354,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 282.49,
                "timePerRequest": 3.54,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"007bc000-af3f-11e7-b112-e7af53125e47\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f98f4a00-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069619}}"
            }
        ]
    },
    {
        "test": {
            "type": "history",
            "workers": 4,
            "concurrency": 5,
            "keep_alive": 5,
            "requestsPerWorker": 100
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.128,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 781.25,
                "timePerRequest": 1.28,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"01a6d280-af3f-11e7-9b23-0b7fd8015cb9\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f98f4a00-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069619}}"
            },
            {
                "worker": "performance-2.cot.primer.XXX#1",
                "totalTime": 0.13,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 769.23,
                "timePerRequest": 1.3,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"01a60f30-af3f-11e7-8fc0-230f3fef4839\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f98f4a00-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069619}}"
            },
            {
                "worker": "performance-3.cot.primer.XXX#2",
                "totalTime": 0.129,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 775.19,
                "timePerRequest": 1.29,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"01a65d50-af3f-11e7-b0ed-a3c3b7f51f3e\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f98f4a00-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069619}}"
            },
            {
                "worker": "performance-4.cot.primer.XXX#3",
                "totalTime": 0.128,
                "complete": 100,
                "failed": 0,
                "requestsPerSecond": 781.25,
                "timePerRequest": 1.28,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"01a6ab70-af3f-11e7-965a-3fec1b219fc2\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f98f4a00-af3e-11e7-ac49-11b51c404099\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069619}}"
            }
        ]
    },
    {
        "test": {
            "type": "history",
            "workers": 4,
            "concurrency": 5,
            "keep_alive": 5,
            "requestsPerWorker": 1000
        },
        "result": [
            {
                "worker": "performance-1.cot.primer.XXX#0",
                "totalTime": 0.958,
                "complete": 1000,
                "failed": 0,
                "requestsPerSecond": 1043.84,
                "timePerRequest": 0.958,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"02a074c0-af3f-11e7-b00f-795315886eb4\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":1,\"processedAt\":1507807076387,\"counterparty\":\"CgQIARAAEixRdDRIYkpVK0FBZktlYXZhRFQyaFNrckZqdDg5ckFjK3Q5UUFsTGtZcDBBPRgBIAE=\",\"description\":\"rollback debit f6a48620-af3e-11e7-bb2c-b559d08cac15 \",\"spendingLimitChange\":0,\"trxId\":\"f6a48620-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Credit\",\"currentChange\":1},{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069742}}"
            },
            {
                "worker": "performance-3.cot.primer.XXX#1",
                "totalTime": 0.958,
                "complete": 1000,
                "failed": 0,
                "requestsPerSecond": 1043.84,
                "timePerRequest": 0.958,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"02a074c0-af3f-11e7-b763-d13e3c1e9154\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":1,\"processedAt\":1507807076387,\"counterparty\":\"CgQIARAAEixRdDRIYkpVK0FBZktlYXZhRFQyaFNrckZqdDg5ckFjK3Q5UUFsTGtZcDBBPRgBIAE=\",\"description\":\"rollback debit f6a48620-af3e-11e7-bb2c-b559d08cac15 \",\"spendingLimitChange\":0,\"trxId\":\"f6a48620-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Credit\",\"currentChange\":1},{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069742}}"
            },
            {
                "worker": "performance-4.cot.primer.XXX#2",
                "totalTime": 0.961,
                "complete": 1000,
                "failed": 0,
                "requestsPerSecond": 1040.58,
                "timePerRequest": 0.961,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"02a026a0-af3f-11e7-adc4-eb933975d953\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":1,\"processedAt\":1507807076387,\"counterparty\":\"CgQIARAAEixRdDRIYkpVK0FBZktlYXZhRFQyaFNrckZqdDg5ckFjK3Q5UUFsTGtZcDBBPRgBIAE=\",\"description\":\"rollback debit f6a48620-af3e-11e7-bb2c-b559d08cac15 \",\"spendingLimitChange\":0,\"trxId\":\"f6a48620-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Credit\",\"currentChange\":1},{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069742}}"
            },
            {
                "worker": "performance-2.cot.primer.XXX#3",
                "totalTime": 0.954,
                "complete": 1000,
                "failed": 0,
                "requestsPerSecond": 1048.22,
                "timePerRequest": 0.954,
                "writeErrors": "",
                "firstResponse": "{\"id\":\"02a09bd0-af3f-11e7-9ef2-07eb2906ef4c\",\"type\":\"history\",\"body\":{\"entries\":[{\"availableChange\":1,\"processedAt\":1507807076387,\"counterparty\":\"CgQIARAAEixRdDRIYkpVK0FBZktlYXZhRFQyaFNrckZqdDg5ckFjK3Q5UUFsTGtZcDBBPRgBIAE=\",\"description\":\"rollback debit f6a48620-af3e-11e7-bb2c-b559d08cac15 \",\"spendingLimitChange\":0,\"trxId\":\"f6a48620-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Credit\",\"currentChange\":1},{\"availableChange\":-1,\"processedAt\":1507807071117,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f99febd0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070847,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a1e7a0-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070722,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9870ca0-af3e-11e7-bb2c-b559d08cac15\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070404,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9916ce0-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070321,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb1-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070134,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f97e5a10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807070120,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a20eb2-af3e-11e7-9cdc-27a2a4f33090\",\"operation\":\"Debit\",\"currentChange\":-1},{\"availableChange\":-1,\"processedAt\":1507807069742,\"counterparty\":\"CgQIARAAEixjcEt0c3lhaU1tM3I0VVJjT0pYU3lxS05yY0VhOGFCN2hQTGp1RUV0Y21ZPRgBIAE=\",\"spendingLimitChange\":0,\"trxId\":\"f9a7db10-af3e-11e7-b0c7-9fccb2854708\",\"operation\":\"Debit\",\"currentChange\":-1}],\"nextFrom\":1507807069742}}"
            }
        ]
    }
]