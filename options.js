// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const websitesContainer = document.getElementById('websites-container');
    const newWebsiteInput = document.getElementById('new-website');
    const addWebsiteButton = document.getElementById('add-website');
    const saveSettingsButton = document.getElementById('save-settings');
    const statusMessage = document.getElementById('status-message');
    
    // 存储当前网站列表的数组
    let websitesList = [];
    
    // 从Chrome存储中加载网站列表
    function loadWebsites() {
      chrome.storage.local.get(['websitesList'], function(result) {
        // 如果存在网站列表，则使用它；否则使用空数组
        websitesList = result.websitesList || [];
        
        // 渲染网站列表到页面上
        renderWebsitesList();
      });
    }
    
    // 把网站列表渲染到页面上
    function renderWebsitesList() {
      // 清空容器
      websitesContainer.innerHTML = '';
      
      // 如果列表为空，显示提示信息
      if (websitesList.length === 0) {
        websitesContainer.innerHTML = '<p>暂无网站，请在下方添加想要自动打开的网站。</p>';
        return;
      }
      
      // 为每个网站创建一个列表项
      websitesList.forEach(function(website, index) {
        const websiteItem = document.createElement('div');
        websiteItem.className = 'website-item';
        
        const websiteUrl = document.createElement('div');
        websiteUrl.className = 'website-url';
        websiteUrl.textContent = website;
        
        const deleteButton = document.createElement('div');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '✕';
        deleteButton.addEventListener('click', function() {
          deleteWebsite(index);
        });
        
        websiteItem.appendChild(websiteUrl);
        websiteItem.appendChild(deleteButton);
        websitesContainer.appendChild(websiteItem);
      });
    }
    
    // 添加新网站
    function addWebsite() {
      const url = newWebsiteInput.value.trim();
      
      // 验证URL
      if (!url) {
        alert('请输入有效的网站URL');
        return;
      }
      
      // 尝试让URL格式更加规范（添加https://前缀如果没有的话）
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = 'https://' + url;
      }
      
      // 添加到列表
      websitesList.push(formattedUrl);
      
      // 清空输入框并更新UI
      newWebsiteInput.value = '';
      renderWebsitesList();
    }
    
    // 删除网站
    function deleteWebsite(index) {
      // 从数组中移除指定索引的网站
      websitesList.splice(index, 1);
      
      // 更新UI
      renderWebsitesList();
    }
    
    // 保存设置到Chrome存储
    function saveSettings() {
      chrome.storage.local.set({
        websitesList: websitesList
      }, function() {
        // 显示保存成功消息
        statusMessage.textContent = '设置已保存！';
        
        // 3秒后清除消息
        setTimeout(function() {
          statusMessage.textContent = '';
        }, 3000);
      });
    }
    
    // 添加事件监听器
    addWebsiteButton.addEventListener('click', addWebsite);
    
    // 支持在输入框中按Enter键添加网站
    newWebsiteInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        addWebsite();
      }
    });
    
    saveSettingsButton.addEventListener('click', saveSettings);
    
    // 初始加载网站列表
    loadWebsites();
  });