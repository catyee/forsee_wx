module.exports = {
	"parser": "babel-eslint",
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "module",
		"ecmaFeatures": {
			"jsx": true,
			"modules": true,
			"experimentalObjectRestSpread": true
		}
	},
    "env": {
        "browser": true,
		"amd": true,
        "commonjs": true,
        "es6": true,
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "warn",
            "always"
        ],
        "lines-around-comment": [
            "error",
            {
                "beforeBlockComment": true,
				"afterBlockComment": true,
				"beforeLineComment": true,
				"afterLineComment": true
            }
        ]
    },
    "globals": {
        "window": true,
        "$": false,
        "moni": true,
        "Rx": false,
        "console": true
    }
};