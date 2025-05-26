// 当Chrome启动时执行
chrome.runtime.onStartup.addListener(() => {
  checkAndOpenWebsites();
});

// 当扩展安装或更新时也执行一次（可选）
chrome.runtime.onInstalled.addListener((details) => {
  // 只在首次安装时初始化默认设置
  if (details.reason === 'install') {
    initializeDefaultSettings();
  }
});

// 监听来自popup.js的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openWebsitesNow") {
    // 强制立即打开网站，不考虑日期限制
    openWebsites().then(count => {
      sendResponse({success: true, count: count});
    }).catch(error => {
      console.error(`[${new Date().toLocaleString()}] 打开网站时出错:`, error);
      sendResponse({success: false, error: error.message});
    });
    return true; // 表示将异步发送响应
  }
});

// 初始化默认设置
function initializeDefaultSettings() {
  chrome.storage.local.get(['websitesList', 'lastOpenDate'], (result) => {
    let updates = {};
    
    // 如果没有设置过网站列表，则设置一个默认值
    if (!result.websitesList) {
      updates.websitesList = ["https://www.example.com"];
    }
    
    // 如果没有上次打开日期，初始化为空字符串
    if (!result.lastOpenDate) {
      updates.lastOpenDate = '';
    }
    
    // 应用更新
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }
  });
}

// 核心逻辑：检查日期并决定是否打开网页
function checkAndOpenWebsites() {
  // 获取当前日期（使用本地时间，只保留年月日）
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`; // 格式: YYYY-MM-DD
  const currentTime = new Date().toLocaleString();
  
  console.log(`[${currentTime}] 开始检查是否需要打开网站`);
  
  // 从存储中获取上次打开网页的日期
  chrome.storage.local.get(['lastOpenDate'], (result) => {
    const lastOpenDate = result.lastOpenDate;
    console.log(`[${new Date().toLocaleString()}] 上次打开日期: ${lastOpenDate || '未设置'}`);
    console.log(`[${new Date().toLocaleString()}] 当前日期: ${dateString}`);
    
    // 如果今天还没有打开过这些网页，或者 lastOpenDate 未设置
    if (!lastOpenDate || lastOpenDate !== dateString) {
      console.log(`[${new Date().toLocaleString()}] 条件满足，准备打开网站`);
      openWebsites().then(() => {
        // 更新存储的日期
        chrome.storage.local.set({ lastOpenDate: dateString });
        console.log(`[${new Date().toLocaleString()}] 已在${dateString}打开网站并更新日期记录`);
      });
    } else {
      console.log(`[${new Date().toLocaleString()}] 今天(${dateString})已经打开过网站，不再重复打开`);
    }
  });
}

// 打开网站的函数
async function openWebsites() {
  // 从存储中获取网站列表
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['websitesList'], (result) => {
      const websitesList = result.websitesList || [];
      
      // 如果网站列表为空，不执行任何操作
      if (websitesList.length === 0) {
        console.log(`[${new Date().toLocaleString()}] 网站列表为空，没有网站需要打开`);
        resolve(0);
        return;
      }
      
      // 遍历数组并打开每个网站
      console.log(`[${new Date().toLocaleString()}] 开始打开 ${websitesList.length} 个网站`);
      websitesList.forEach((website, index) => {
        // 添加短暂延迟以防止Chrome阻止多个标签页同时打开
        setTimeout(() => {
          console.log(`[${new Date().toLocaleString()}] 打开网站: ${website}`);
          chrome.tabs.create({ url: website });
        }, index * 300); // 每个网站之间间隔300毫秒
      });
      
      // 返回打开的网站数量
      resolve(websitesList.length);
    });
  });
}
