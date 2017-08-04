/**
 * 配置文件加载
 */
var fs = require("fs");
var config = require("config-lite").config;
var Promise = require('promise');
var factory = {
  listener: function (somedir, file_path) {
    // factory.loader(somedir + "/" + config.config_filename);
    fs.watch(somedir, (eventType, filename) => {
      console.log(`事件类型是: ${eventType}`);
      if (filename) {
        console.log(`提供的文件名: ${filename}`);
        // factory.loader(somedir + "/" + filename);
        if ("dict.js" == filename) {
          delete require.cache[file_path + "/" + filename];
          global.dict = require(file_path + "/" + filename);
          console.log(`重新加载配置文件dict.js：${JSON.stringify(global.dict)}`);
        }
        if ("runtime_config.js" == filename) {
          delete require.cache[file_path + "/" + filename]
          global.runtime_config = require(file_path + "/" + filename);
          console.log(`重新加载配置文件runtime_config.js：${JSON.stringify(global.runtime_config)}`);
        }
      } else {
        console.log("未提供文件名");
      }
    });
  },
  loader: function (file) {
    return new Promise(function (resolve, reject) {
      fs.readFile(file, "utf-8", function (err, data) {
        if (err) {
          console.log("读取配置文件失败:", err);
        } else {
          console.log("读取配置文件:", data);
          try {
            resolve(data);
          } catch (error) {
            console.log("配置文件错误:", error);
          }
        }
      });
    });
  }
};
module.exports = factory;
