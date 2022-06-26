const fs = require("fs");
const os = require("os");
const path = require("path");

// diff(['a', 'b'], ['a']) == ['b']
const diff = (origin, target) => {
  target = target.reduce((o, k) => {
    o[k] = "";
    return o;
  }, {});

  return origin.filter(key => target[key] === undefined);
};

const localesPath = path.join(__dirname, "..", "locales");

const i18nJsonFileList = fs
  .readFileSync(localesPath, {
    encoding: "utf8",
  })
  .filter(file => path.extname(file) === ".json");

let polymerization = [];
for (const file of i18nJsonFileList) {
  const fullPath = path.join(localesPath, file);
  const keys = Object.keys(require(fullPath));

  polymerization.push({
    name: file,
    keys,
  });
}

polymerization.sort((a, b) => b.keys.length - a.keys.length);

const calibrationData = polymerization[0];
const errorInfo = [];

// 跳过第一个数据，因为最长的数据它将用作校准数据。
for (let i = 1; i < polymerization.length; i++) {
  let errorMessage = "";
  const currentInfo = polymerization[i];

  const mismatchKeys = diff(calibrationData.keys, currentInfo.keys);
  const superfluousKeys = diff(currentInfo.keys, calibrationData.keys);

  // 不为了0说明国际化数据对不上，需要告知开发者
  if (mismatchKeys.length !== 0) {
    errorMessage += `${currentInfo.name} mismatch keys: ${mismatchKeys}. `;
  }

  if (superfluousKeys.length !== 0) {
    errorMessage += `superfluous keys: ${superfluousKeys}.`;
  }

  if (errorMessage !== "") {
    errorInfo.push(errorMessage);
  }
}

if (errorInfo.length !== 0) {
  console.log(`current calibration file: ${calibrationData.name}`);
  console.log(errorInfo.join(os.EOL), os.EOL);
  process.exit(1);
}
