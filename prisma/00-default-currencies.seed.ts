import { type PrismaClient } from "../dist/generated/prisma/client.js";

const CURRENCIES = [
    {
        "code": "AED",
        "numericCode": "784",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "United Arab Emirates Dirham",
        "isActive": true
    },
    {
        "code": "AFN",
        "numericCode": "971",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Afghan Afghani",
        "isActive": true
    },
    {
        "code": "ALL",
        "numericCode": "008",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Albanian Lek",
        "isActive": true
    },
    {
        "code": "AMD",
        "numericCode": "051",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Armenian Dram",
        "isActive": true
    },
    {
        "code": "ANG",
        "numericCode": "532",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Netherlands Antillean Guilder",
        "isActive": true
    },
    {
        "code": "ARS",
        "numericCode": "032",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Argentine Peso",
        "isActive": true
    },
    {
        "code": "AUD",
        "numericCode": "036",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Australian Dollar",
        "isActive": true
    },
    {
        "code": "AWG",
        "numericCode": "533",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Aruban Florin",
        "isActive": true
    },
    {
        "code": "AZN",
        "numericCode": "944",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Azerbaijani Manat",
        "isActive": true
    },
    {
        "code": "BAM",
        "numericCode": "977",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Bosnia and Herzegovina Convertible Mark",
        "isActive": true
    },
    {
        "code": "BBD",
        "numericCode": "052",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Barbados Dollar",
        "isActive": true
    },
    {
        "code": "BDT",
        "numericCode": "050",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Bangladeshi Taka",
        "isActive": true
    },
    {
        "code": "BHD",
        "numericCode": "048",
        "minorUnits": 3,
        "cashRoundingIncrement": null,
        "name": "Bahraini Dinar",
        "isActive": true
    },
    {
        "code": "BMD",
        "numericCode": "060",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Bermudian Dollar",
        "isActive": true
    },
    {
        "code": "BND",
        "numericCode": "096",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Brunei Dollar",
        "isActive": true
    },
    {
        "code": "BOB",
        "numericCode": "068",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Bolivian Boliviano",
        "isActive": true
    },
    {
        "code": "BRL",
        "numericCode": "986",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Brazilian Real",
        "isActive": true
    },
    {
        "code": "BSD",
        "numericCode": "044",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Bahamian Dollar",
        "isActive": true
    },
    {
        "code": "BTN",
        "numericCode": "064",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Bhutanese Ngultrum",
        "isActive": true
    },
    {
        "code": "BYN",
        "numericCode": "933",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Belarusian Ruble",
        "isActive": true
    },
    {
        "code": "BZD",
        "numericCode": "084",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Belize Dollar",
        "isActive": true
    },
    {
        "code": "CAD",
        "numericCode": "124",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Canadian Dollar",
        "isActive": true
    },
    {
        "code": "CHF",
        "numericCode": "756",
        "minorUnits": 2,
        "cashRoundingIncrement": "0.05",
        "name": "Swiss Franc",
        "isActive": true
    },
    {
        "code": "CLP",
        "numericCode": "152",
        "minorUnits": 0,
        "cashRoundingIncrement": null,
        "name": "Chilean Peso",
        "isActive": true
    },
    {
        "code": "CNY",
        "numericCode": "156",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Chinese Yuan Renminbi",
        "isActive": true
    },
    {
        "code": "COP",
        "numericCode": "170",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Colombian Peso",
        "isActive": true
    },
    {
        "code": "CRC",
        "numericCode": "188",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Costa Rican Colon",
        "isActive": true
    },
    {
        "code": "CUP",
        "numericCode": "192",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Cuban Peso",
        "isActive": true
    },
    {
        "code": "CZK",
        "numericCode": "203",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Czech Koruna",
        "isActive": true
    },
    {
        "code": "DKK",
        "numericCode": "208",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Danish Krone",
        "isActive": true
    },
    {
        "code": "DOP",
        "numericCode": "214",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Dominican Peso",
        "isActive": true
    },
    {
        "code": "EGP",
        "numericCode": "818",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Egyptian Pound",
        "isActive": true
    },
    {
        "code": "EUR",
        "numericCode": "978",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Euro",
        "isActive": true
    },
    {
        "code": "FJD",
        "numericCode": "242",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Fiji Dollar",
        "isActive": true
    },
    {
        "code": "GBP",
        "numericCode": "826",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Pound Sterling",
        "isActive": true
    },
    {
        "code": "GEL",
        "numericCode": "981",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Georgian Lari",
        "isActive": true
    },
    {
        "code": "GHS",
        "numericCode": "936",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Ghanaian Cedi",
        "isActive": true
    },
    {
        "code": "GTQ",
        "numericCode": "320",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Guatemalan Quetzal",
        "isActive": true
    },
    {
        "code": "GYD",
        "numericCode": "328",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Guyanese Dollar",
        "isActive": true
    },
    {
        "code": "HKD",
        "numericCode": "344",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Hong Kong Dollar",
        "isActive": true
    },
    {
        "code": "HNL",
        "numericCode": "340",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Honduran Lempira",
        "isActive": true
    },
    {
        "code": "HTG",
        "numericCode": "332",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Haitian Gourde",
        "isActive": true
    },
    {
        "code": "HUF",
        "numericCode": "348",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Hungarian Forint",
        "isActive": true
    },
    {
        "code": "IDR",
        "numericCode": "360",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Indonesian Rupiah",
        "isActive": true
    },
    {
        "code": "ILS",
        "numericCode": "376",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Israeli New Shekel",
        "isActive": true
    },
    {
        "code": "INR",
        "numericCode": "356",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Indian Rupee",
        "isActive": true
    },
    {
        "code": "ISK",
        "numericCode": "352",
        "minorUnits": 0,
        "cashRoundingIncrement": null,
        "name": "Icelandic Krona",
        "isActive": true
    },
    {
        "code": "JMD",
        "numericCode": "388",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Jamaican Dollar",
        "isActive": true
    },
    {
        "code": "JOD",
        "numericCode": "400",
        "minorUnits": 3,
        "cashRoundingIncrement": null,
        "name": "Jordanian Dinar",
        "isActive": true
    },
    {
        "code": "JPY",
        "numericCode": "392",
        "minorUnits": 0,
        "cashRoundingIncrement": null,
        "name": "Japanese Yen",
        "isActive": true
    },
    {
        "code": "KES",
        "numericCode": "404",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Kenyan Shilling",
        "isActive": true
    },
    {
        "code": "KGS",
        "numericCode": "417",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Kyrgyzstani Som",
        "isActive": true
    },
    {
        "code": "KHR",
        "numericCode": "116",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Cambodian Riel",
        "isActive": true
    },
    {
        "code": "KPW",
        "numericCode": "408",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "North Korean Won",
        "isActive": true
    },
    {
        "code": "KRW",
        "numericCode": "410",
        "minorUnits": 0,
        "cashRoundingIncrement": null,
        "name": "South Korean Won",
        "isActive": true
    },
    {
        "code": "KWD",
        "numericCode": "414",
        "minorUnits": 3,
        "cashRoundingIncrement": null,
        "name": "Kuwaiti Dinar",
        "isActive": true
    },
    {
        "code": "KZT",
        "numericCode": "398",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Kazakhstani Tenge",
        "isActive": true
    },
    {
        "code": "LAK",
        "numericCode": "418",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Lao Kip",
        "isActive": true
    },
    {
        "code": "LBP",
        "numericCode": "422",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Lebanese Pound",
        "isActive": true
    },
    {
        "code": "LKR",
        "numericCode": "144",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Sri Lankan Rupee",
        "isActive": true
    },
    {
        "code": "MAD",
        "numericCode": "504",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Moroccan Dirham",
        "isActive": true
    },
    {
        "code": "MDL",
        "numericCode": "498",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Moldovan Leu",
        "isActive": true
    },
    {
        "code": "MKD",
        "numericCode": "807",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Macedonian Denar",
        "isActive": true
    },
    {
        "code": "MMK",
        "numericCode": "104",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Myanmar Kyat",
        "isActive": true
    },
    {
        "code": "MNT",
        "numericCode": "496",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Mongolian Tugrik",
        "isActive": true
    },
    {
        "code": "MOP",
        "numericCode": "446",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Macanese Pataca",
        "isActive": true
    },
    {
        "code": "MVR",
        "numericCode": "462",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Maldivian Rufiyaa",
        "isActive": true
    },
    {
        "code": "MXN",
        "numericCode": "484",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Mexican Peso",
        "isActive": true
    },
    {
        "code": "MYR",
        "numericCode": "458",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Malaysian Ringgit",
        "isActive": true
    },
    {
        "code": "NGN",
        "numericCode": "566",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Nigerian Naira",
        "isActive": true
    },
    {
        "code": "NIO",
        "numericCode": "558",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Nicaraguan Cordoba",
        "isActive": true
    },
    {
        "code": "NOK",
        "numericCode": "578",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Norwegian Krone",
        "isActive": true
    },
    {
        "code": "NPR",
        "numericCode": "524",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Nepalese Rupee",
        "isActive": true
    },
    {
        "code": "NZD",
        "numericCode": "554",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "New Zealand Dollar",
        "isActive": true
    },
    {
        "code": "OMR",
        "numericCode": "512",
        "minorUnits": 3,
        "cashRoundingIncrement": null,
        "name": "Omani Rial",
        "isActive": true
    },
    {
        "code": "PAB",
        "numericCode": "590",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Panamanian Balboa",
        "isActive": true
    },
    {
        "code": "PEN",
        "numericCode": "604",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Peruvian Sol",
        "isActive": true
    },
    {
        "code": "PGK",
        "numericCode": "598",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Papua New Guinean Kina",
        "isActive": true
    },
    {
        "code": "PHP",
        "numericCode": "608",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Philippine Peso",
        "isActive": true
    },
    {
        "code": "PKR",
        "numericCode": "586",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Pakistani Rupee",
        "isActive": true
    },
    {
        "code": "PLN",
        "numericCode": "985",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Polish Zloty",
        "isActive": true
    },
    {
        "code": "PYG",
        "numericCode": "600",
        "minorUnits": 0,
        "cashRoundingIncrement": null,
        "name": "Paraguayan Guarani",
        "isActive": true
    },
    {
        "code": "QAR",
        "numericCode": "634",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Qatari Riyal",
        "isActive": true
    },
    {
        "code": "RON",
        "numericCode": "946",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Romanian Leu",
        "isActive": true
    },
    {
        "code": "RSD",
        "numericCode": "941",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Serbian Dinar",
        "isActive": true
    },
    {
        "code": "RUB",
        "numericCode": "643",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Russian Ruble",
        "isActive": true
    },
    {
        "code": "SAR",
        "numericCode": "682",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Saudi Riyal",
        "isActive": true
    },
    {
        "code": "SEK",
        "numericCode": "752",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Swedish Krona",
        "isActive": true
    },
    {
        "code": "SGD",
        "numericCode": "702",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Singapore Dollar",
        "isActive": true
    },
    {
        "code": "SRD",
        "numericCode": "968",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Surinamese Dollar",
        "isActive": true
    },
    {
        "code": "THB",
        "numericCode": "764",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Thai Baht",
        "isActive": true
    },
    {
        "code": "TJS",
        "numericCode": "972",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Tajikistani Somoni",
        "isActive": true
    },
    {
        "code": "TMT",
        "numericCode": "934",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Turkmenistan Manat",
        "isActive": true
    },
    {
        "code": "TOP",
        "numericCode": "776",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Tongan Paʻanga",
        "isActive": true
    },
    {
        "code": "TRY",
        "numericCode": "949",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Turkish Lira",
        "isActive": true
    },
    {
        "code": "TTD",
        "numericCode": "780",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Trinidad and Tobago Dollar",
        "isActive": true
    },
    {
        "code": "TWD",
        "numericCode": "901",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "New Taiwan Dollar",
        "isActive": true
    },
    {
        "code": "TZS",
        "numericCode": "834",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Tanzanian Shilling",
        "isActive": true
    },
    {
        "code": "UAH",
        "numericCode": "980",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Ukrainian Hryvnia",
        "isActive": true
    },
    {
        "code": "UGX",
        "numericCode": "800",
        "minorUnits": 0,
        "cashRoundingIncrement": null,
        "name": "Ugandan Shilling",
        "isActive": true
    },
    {
        "code": "USD",
        "numericCode": "840",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "United States Dollar",
        "isActive": true
    },
    {
        "code": "UYU",
        "numericCode": "858",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Uruguayan Peso",
        "isActive": true
    },
    {
        "code": "UZS",
        "numericCode": "860",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Uzbekistani Som",
        "isActive": true
    },
    {
        "code": "VES",
        "numericCode": "928",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Venezuelan Bolivar Soberano",
        "isActive": true
    },
    {
        "code": "VND",
        "numericCode": "704",
        "minorUnits": 0,
        "cashRoundingIncrement": null,
        "name": "Vietnamese Dong",
        "isActive": true
    },
    {
        "code": "VUV",
        "numericCode": "548",
        "minorUnits": 0,
        "cashRoundingIncrement": null,
        "name": "Vanuatu Vatu",
        "isActive": true
    },
    {
        "code": "WST",
        "numericCode": "882",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "Samoan Tala",
        "isActive": true
    },
    {
        "code": "XCD",
        "numericCode": "951",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "East Caribbean Dollar",
        "isActive": true
    },
    {
        "code": "ZAR",
        "numericCode": "710",
        "minorUnits": 2,
        "cashRoundingIncrement": null,
        "name": "South African Rand",
        "isActive": true
    }
];

export default async function (prisma: PrismaClient) {
    await prisma.currency.createMany({
        data: CURRENCIES,
        skipDuplicates: true,
    })
}
