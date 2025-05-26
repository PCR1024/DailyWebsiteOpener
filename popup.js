document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const openOptionsButton = document.getElementById('open-options');
  const openNowButton = document.getElementById('open-now');
  const statusDiv = document.getElementById('status');
  
  // 打开选项页面
  openOptionsButton.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  // 立即打开网站列表
  openNowButton.addEventListener('click', function() {
    // 调用background.js中的函数
    chrome.runtime.sendMessage({action: "openWebsitesNow"}, function(response) {
      if (response && response.success) {
        statusDiv.textContent = `已打开 ${response.count} 个网站`;
      } else {
        statusDiv.textContent = "操作失败，请检查设置";
      }
    });
  });
  
  // 显示上次打开的日期
  chrome.storage.local.get(['lastOpenDate'], function(result) {
    if (result.lastOpenDate) {
      // 格式化日期 YYYY-MM-DD 为更友好的格式
      const dateParts = result.lastOpenDate.split('-');
      const formattedDate = `${dateParts[0]}年${dateParts[1]}月${dateParts[2]}日`;
      statusDiv.textContent = `上次打开日期: ${formattedDate}`;
    } else {
      statusDiv.textContent = "尚未打开过网站";
    }
  });
});