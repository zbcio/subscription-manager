// 订阅续期通知网站 - 基于CloudFlare Workers

// 定义HTML模板
const loginPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>订阅管理系统</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
  <style>
    .login-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .login-box {
      backdrop-filter: blur(8px);
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: all 0.3s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    .input-field {
      transition: all 0.3s;
      border: 1px solid #e2e8f0;
    }
    .input-field:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
    }
  </style>
</head>
<body class="login-container flex items-center justify-center">
  <div class="login-box p-8 rounded-xl w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-800"><i class="fas fa-calendar-check mr-2"></i>订阅管理系统</h1>
      <p class="text-gray-600 mt-2">登录管理您的订阅提醒</p>
    </div>
    
    <form id="loginForm" class="space-y-6">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
          <i class="fas fa-user mr-2"></i>用户名
        </label>
        <input type="text" id="username" name="username" required
          class="input-field w-full px-4 py-3 rounded-lg text-gray-700 focus:outline-none">
      </div>
      
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          <i class="fas fa-lock mr-2"></i>密码
        </label>
        <input type="password" id="password" name="password" required
          class="input-field w-full px-4 py-3 rounded-lg text-gray-700 focus:outline-none">
      </div>
      
      <button type="submit" 
        class="btn-primary w-full py-3 rounded-lg text-white font-medium focus:outline-none">
        <i class="fas fa-sign-in-alt mr-2"></i>登录
      </button>
      
      <div id="errorMsg" class="text-red-500 text-center"></div>
    </form>
  </div>
  
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // 显示加载状态
      const button = e.target.querySelector('button');
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>登录中...';
      button.disabled = true;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
          window.location.href = '/admin';
        } else {
          document.getElementById('errorMsg').textContent = result.message || '用户名或密码错误';
          // 恢复按钮状态
          button.innerHTML = originalContent;
          button.disabled = false;
        }
      } catch (error) {
        document.getElementById('errorMsg').textContent = '发生错误，请稍后再试';
        // 恢复按钮状态
        button.innerHTML = originalContent;
        button.disabled = false;
      }
    });
  </script>
</body>
</html>
`;

const adminPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>订阅管理系统</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
  <style>
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: all 0.3s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    .btn-danger {
      background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
      transition: all 0.3s;
    }
    .btn-danger:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    .btn-success {
      background: linear-gradient(135deg, #34d399 0%, #059669 100%);
      transition: all 0.3s;
    }
    .btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    .btn-warning {
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
      transition: all 0.3s;
    }
    .btn-warning:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    .table-container {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .modal-container {
      backdrop-filter: blur(8px);
    }
    .badge-success {
      background-color: #10b981;
    }
    .badge-warning {
      background-color: #f59e0b;
    }
    .badge-danger {
      background-color: #ef4444;
    }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <i class="fas fa-calendar-check text-indigo-600 text-2xl mr-2"></i>
          <span class="font-bold text-xl text-gray-800">订阅管理系统</span>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/admin" class="text-indigo-600 border-b-2 border-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-list mr-1"></i>订阅列表
          </a>
          <a href="/admin/config" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-cog mr-1"></i>系统配置
          </a>
          <a href="/api/logout" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-sign-out-alt mr-1"></i>退出登录
          </a>
        </div>
      </div>
    </div>
  </nav>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">订阅列表</h2>
      <div class="flex space-x-2">
        <button id="testNotificationBtn" class="btn-warning text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
          <i class="fas fa-bell mr-2"></i>测试通知
        </button>
        <button id="addSubscriptionBtn" class="btn-primary text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
          <i class="fas fa-plus mr-2"></i>添加新订阅
        </button>
      </div>
    </div>
    
    <div class="table-container bg-white rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到期时间</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提醒时间</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody id="subscriptionsBody" class="bg-white divide-y divide-gray-200">
          <!-- 数据将通过JavaScript填充 -->
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- 添加/编辑订阅的模态框 -->
  <div id="subscriptionModal" class="fixed inset-0 bg-black bg-opacity-50 modal-container hidden flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 id="modalTitle" class="text-lg font-medium text-gray-900">添加新订阅</h3>
          <button id="closeModal" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form id="subscriptionForm" class="space-y-4">
          <input type="hidden" id="subscriptionId">
          
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">名称</label>
            <input type="text" id="name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          
          <div>
            <label for="customType" class="block text-sm font-medium text-gray-700">类型</label>
            <input type="text" id="customType" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700">备注</label>
            <textarea id="notes" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
          
          <div>
            <label class="inline-flex items-center">
              <input type="checkbox" id="isActive" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" checked>
              <span class="ml-2 text-sm text-gray-700">启用提醒</span>
            </label>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- 通知测试结果模态框 -->
  <div id="notificationResultModal" class="fixed inset-0 bg-black bg-opacity-50 modal-container hidden flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">通知测试结果</h3>
          <button class="notificationResultClose text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div id="notificationResultContent" class="py-4"></div>
        
        <div class="flex justify-end">
          <button class="notificationResultClose btn-primary text-white px-4 py-2 rounded-md text-sm font-medium">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // 获取所有订阅
    async function loadSubscriptions() {
      try {
        // 显示加载状态
        const tbody = document.getElementById('subscriptionsBody');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i>加载中...</td></tr>';
        
        const response = await fetch('/api/subscriptions');
        const data = await response.json();
        
        tbody.innerHTML = '';
        
        if (data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">没有订阅数据</td></tr>';
          return;
        }
        
        data.forEach(subscription => {
          const row = document.createElement('tr');
          row.className = subscription.isActive === false ? 'hover:bg-gray-50 bg-gray-100' : 'hover:bg-gray-50';
          
          const expiryDate = new Date(subscription.expiryDate);
          const now = new Date();
          const daysDiff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          
          let statusHtml = '';
          if (!subscription.isActive) {
            statusHtml = '<span class="px-2 py-1 text-xs font-medium rounded-full text-white bg-gray-500"><i class="fas fa-pause-circle mr-1"></i>已停用</span>';
          } else if (daysDiff < 0) {
            statusHtml = '<span class="px-2 py-1 text-xs font-medium rounded-full text-white bg-red-500"><i class="fas fa-exclamation-circle mr-1"></i>已过期</span>';
          } else if (daysDiff <= subscription.reminderDays) {
            statusHtml = '<span class="px-2 py-1 text-xs font-medium rounded-full text-white bg-yellow-500"><i class="fas fa-exclamation-triangle mr-1"></i>即将到期</span>';
          } else {
            statusHtml = '<span class="px-2 py-1 text-xs font-medium rounded-full text-white bg-green-500"><i class="fas fa-check-circle mr-1"></i>正常</span>';
          }
          
          // 周期信息
          let periodText = '';
          if (subscription.periodValue && subscription.periodUnit) {
            const unitMap = { day: '天', month: '月', year: '年' };
            periodText = subscription.periodValue + ' ' + (unitMap[subscription.periodUnit] || subscription.periodUnit);
          }
          
          // 使用字符串拼接而不是模板字符串来避免JSX解析问题
          row.innerHTML = 
            '<td class="px-6 py-4 whitespace-nowrap">' + 
              '<div class="text-sm font-medium text-gray-900">' + subscription.name + '</div>' +
              (subscription.notes ? '<div class="text-xs text-gray-500">' + subscription.notes + '</div>' : '') +
            '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap">' + 
              '<div class="text-sm text-gray-900">' + 
                '<i class="fas fa-tag mr-1"></i>' + (subscription.customType || '其他') + 
              '</div>' +
              (periodText ? '<div class="text-xs text-gray-500">周期: ' + periodText + '</div>' : '') +
            '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap">' + 
              '<div class="text-sm text-gray-900">' + new Date(subscription.expiryDate).toLocaleDateString() + '</div>' +
              '<div class="text-xs text-gray-500">' + (daysDiff < 0 ? '已过期' + Math.abs(daysDiff) + '天' : '还剩' + daysDiff + '天') + '</div>' +
              (subscription.startDate ? '<div class="text-xs text-gray-500">开始: ' + new Date(subscription.startDate).toLocaleDateString() + '</div>' : '') +
            '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">' + 
              '<i class="fas fa-bell mr-1"></i>提前' + subscription.reminderDays + '天' +
            '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap">' + statusHtml + '</td>' +
            '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">' +
              '<button class="edit btn-primary text-white px-3 py-1 rounded-md mr-2" data-id="' + subscription.id + '"><i class="fas fa-edit mr-1"></i>编辑</button>' +
              '<button class="delete btn-danger text-white px-3 py-1 rounded-md" data-id="' + subscription.id + '"><i class="fas fa-trash-alt mr-1"></i>删除</button>' +
              (subscription.isActive ? 
                '<button class="toggle-status btn-warning text-white px-3 py-1 rounded-md mt-1" data-id="' + subscription.id + '" data-action="deactivate"><i class="fas fa-pause-circle mr-1"></i>停用</button>' : 
                '<button class="toggle-status btn-success text-white px-3 py-1 rounded-md mt-1" data-id="' + subscription.id + '" data-action="activate"><i class="fas fa-play-circle mr-1"></i>启用</button>') +
            '</td>';
          
          tbody.appendChild(row);
        });
        
        // 添加事件监听器
        document.querySelectorAll('.edit').forEach(button => {
          button.addEventListener('click', editSubscription);
        });
        
        document.querySelectorAll('.delete').forEach(button => {
          button.addEventListener('click', deleteSubscription);
        });
        
        document.querySelectorAll('.toggle-status').forEach(button => {
          button.addEventListener('click', toggleSubscriptionStatus);
        });
      } catch (error) {
        console.error('加载订阅失败:', error);
        const tbody = document.getElementById('subscriptionsBody');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500"><i class="fas fa-exclamation-circle mr-2"></i>加载失败，请刷新页面重试</td></tr>';
      }
    }
    
    // 切换订阅状态（启用/停用）
    async function toggleSubscriptionStatus(e) {
      const id = e.target.dataset.id || e.target.parentElement.dataset.id;
      const action = e.target.dataset.action || e.target.parentElement.dataset.action;
      const isActivate = action === 'activate';
      
      if (!confirm(isActivate ? '确定要启用这个订阅吗？' : '确定要停用这个订阅吗？')) return;
      
      // 显示加载状态
      const button = e.target.tagName === 'BUTTON' ? e.target : e.target.parentElement;
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>' + (isActivate ? '启用中...' : '停用中...');
      button.disabled = true;
      
      try {
        const response = await fetch('/api/subscriptions/' + id + '/toggle-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: isActivate })
        });
        
        if (response.ok) {
          loadSubscriptions();
        } else {
          const error = await response.json();
          alert((isActivate ? '启用' : '停用') + '失败: ' + (error.message || '未知错误'));
          
          // 恢复按钮状态
          button.innerHTML = originalContent;
          button.disabled = false;
        }
      } catch (error) {
        console.error((isActivate ? '启用' : '停用') + '订阅失败:', error);
        alert((isActivate ? '启用' : '停用') + '失败，请稍后再试');
        
        // 恢复按钮状态
        button.innerHTML = originalContent;
        button.disabled = false;
      }
    }
    
    // 添加新订阅按钮
    document.getElementById('addSubscriptionBtn').addEventListener('click', () => {
      document.getElementById('modalTitle').textContent = '添加新订阅';
      document.getElementById('subscriptionModal').classList.remove('hidden');
      
      // 设置表单内容
      document.getElementById('subscriptionForm').innerHTML = 
        '<input type="hidden" id="subscriptionId">' +
        
        '<div class="border-b border-gray-200 pb-6 space-y-4">' +
          '<h3 class="text-lg font-medium text-gray-900">基本信息</h3>' +
          
          '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
            '<div>' +
              '<label for="name" class="block text-sm font-medium text-gray-700">名称</label>' +
              '<input type="text" id="name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
            '</div>' +
            
            '<div>' +
              '<label for="customType" class="block text-sm font-medium text-gray-700">类型</label>' +
              '<input type="text" id="customType" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
            '</div>' +
          '</div>' +
          
          '<div>' +
            '<label for="notes" class="block text-sm font-medium text-gray-700">备注</label>' +
            '<textarea id="notes" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>' +
          '</div>' +
          
          '<div>' +
            '<label class="inline-flex items-center">' +
              '<input type="checkbox" id="isActive" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" checked>' +
              '<span class="ml-2 text-sm text-gray-700">启用提醒</span>' +
            '</label>' +
          '</div>' +
        '</div>' +

        '<div class="border-b border-gray-200 py-6 space-y-4">' +
          '<h3 class="text-lg font-medium text-gray-900">周期设置</h3>' +
          
          '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
            '<div>' +
              '<label for="startDate" class="block text-sm font-medium text-gray-700">开始日期</label>' +
              '<input type="date" id="startDate" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
            '</div>' +
            
            '<div>' +
              '<label for="expiryDate" class="block text-sm font-medium text-gray-700">到期日期 (自动计算)</label>' +
              '<input type="date" id="expiryDate" readonly class="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500 sm:text-sm">' +
            '</div>' +
          '</div>' +
          
          '<div class="grid grid-cols-3 gap-4">' +
            '<div>' +
              '<label for="periodValue" class="block text-sm font-medium text-gray-700">周期值</label>' +
              '<input type="number" id="periodValue" min="1" value="1" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
            '</div>' +
            
            '<div>' +
              '<label for="periodUnit" class="block text-sm font-medium text-gray-700">周期单位</label>' +
              '<select id="periodUnit" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
                '<option value="day">天</option>' +
                '<option value="month" selected>月</option>' +
                '<option value="year">年</option>' +
              '</select>' +
            '</div>' +
            
            '<div>' +
              '<label for="reminderDays" class="block text-sm font-medium text-gray-700">提前提醒天数</label>' +
              '<input type="number" id="reminderDays" min="0" max="30" value="7" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
            '</div>' +
          '</div>' +
          
          '<div class="mt-2">' +
            '<button type="button" id="calculateExpiryBtn" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">' +
              '<i class="fas fa-calculator mr-2"></i>计算到期日期' +
            '</button>' +
          '</div>' +
        '</div>' +
        
        '<div class="flex justify-end mt-6">' +
          '<button type="submit" id="saveSubscription" class="btn-primary text-white px-4 py-2 rounded-md text-sm font-medium">' +
            '<i class="fas fa-save mr-2"></i>保存' +
          '</button>' +
        '</div>';
      
      // 设置默认日期为今天
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('startDate').value = today;
      
      // 自动计算默认到期日期
      calculateExpiryDate();
      
      // 添加计算到期日期按钮事件
      document.getElementById('calculateExpiryBtn').addEventListener('click', calculateExpiryDate);
      
      // 开始日期和周期值/单位变化时，自动计算
      document.getElementById('startDate').addEventListener('change', calculateExpiryDate);
      document.getElementById('periodValue').addEventListener('change', calculateExpiryDate);
      document.getElementById('periodUnit').addEventListener('change', calculateExpiryDate);
      
      // 添加提交事件监听器
      document.getElementById('subscriptionForm').addEventListener('submit', submitHandler);
    });
    
    // 关闭模态框
    document.getElementById('closeModal').addEventListener('click', () => {
      document.getElementById('subscriptionModal').classList.add('hidden');
    });
    
    // 点击模态框外部关闭
    document.getElementById('subscriptionModal').addEventListener('click', (event) => {
      if (event.target === document.getElementById('subscriptionModal')) {
        document.getElementById('subscriptionModal').classList.add('hidden');
      }
    });
    
    // 关闭通知测试结果模态框
    document.querySelectorAll('.notificationResultClose').forEach(el => {
      el.addEventListener('click', () => {
        document.getElementById('notificationResultModal').classList.add('hidden');
      });
    });
    
    // 点击模态框外部关闭
    document.getElementById('notificationResultModal').addEventListener('click', (event) => {
      if (event.target === document.getElementById('notificationResultModal')) {
        document.getElementById('notificationResultModal').classList.add('hidden');
      }
    });
    
    // 保存订阅
    document.getElementById('subscriptionForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('subscriptionId').value;
      const subscription = {
        name: document.getElementById('name').value,
        customType: document.getElementById('customType').value,
        notes: document.getElementById('notes').value || '',
        isActive: document.getElementById('isActive').checked,
        startDate: document.getElementById('startDate').value,
        expiryDate: document.getElementById('expiryDate').value,
        periodValue: parseInt(document.getElementById('periodValue').value),
        periodUnit: document.getElementById('periodUnit').value,
        reminderDays: parseInt(document.getElementById('reminderDays').value)
      };
      
      // 显示加载状态
      const button = document.getElementById('saveSubscription');
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>保存中...';
      button.disabled = true;
      
      try {
        const url = id ? '/api/subscriptions/' + id : '/api/subscriptions';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        
        if (response.ok) {
          document.getElementById('subscriptionModal').classList.add('hidden');
          loadSubscriptions();
        } else {
          const error = await response.json();
          alert('保存失败: ' + (error.message || '未知错误'));
        }
      } catch (error) {
        console.error('保存订阅失败:', error);
        alert('保存失败，请稍后再试');
      } finally {
        // 恢复按钮状态
        button.innerHTML = originalContent;
        button.disabled = false;
      }
    });
    
    // 编辑订阅
    async function editSubscription(e) {
      const id = e.target.dataset.id || e.target.parentElement.dataset.id;
      
      // 显示加载状态
      document.getElementById('subscriptionModal').classList.remove('hidden');
      document.getElementById('subscriptionForm').innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i>加载中...</div>';
      
      try {
        const response = await fetch('/api/subscriptions/' + id);
        const subscription = await response.json();
        
        // 恢复表单内容
        // 使用字符串拼接避免模板字符串中的JSX解析问题
        document.getElementById('subscriptionForm').innerHTML = 
          '<input type="hidden" id="subscriptionId">' +
          
          '<div class="border-b border-gray-200 pb-6 space-y-4">' +
            '<h3 class="text-lg font-medium text-gray-900">基本信息</h3>' +
            
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
              '<div>' +
                '<label for="name" class="block text-sm font-medium text-gray-700">名称</label>' +
                '<input type="text" id="name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
              '</div>' +
              
              '<div>' +
                '<label for="customType" class="block text-sm font-medium text-gray-700">类型</label>' +
                '<input type="text" id="customType" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
              '</div>' +
            '</div>' +
            
            '<div>' +
              '<label for="notes" class="block text-sm font-medium text-gray-700">备注</label>' +
              '<textarea id="notes" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>' +
            '</div>' +
            
            '<div>' +
              '<label class="inline-flex items-center">' +
                '<input type="checkbox" id="isActive" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" checked>' +
                '<span class="ml-2 text-sm text-gray-700">启用提醒</span>' +
              '</label>' +
            '</div>' +
          '</div>' +

          '<div class="border-b border-gray-200 py-6 space-y-4">' +
            '<h3 class="text-lg font-medium text-gray-900">周期设置</h3>' +
            
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
              '<div>' +
                '<label for="startDate" class="block text-sm font-medium text-gray-700">开始日期</label>' +
                '<input type="date" id="startDate" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
              '</div>' +
              
              '<div>' +
                '<label for="expiryDate" class="block text-sm font-medium text-gray-700">到期日期 (自动计算)</label>' +
                '<input type="date" id="expiryDate" readonly class="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500 sm:text-sm">' +
              '</div>' +
            '</div>' +
            
            '<div class="grid grid-cols-3 gap-4">' +
              '<div>' +
                '<label for="periodValue" class="block text-sm font-medium text-gray-700">周期值</label>' +
                '<input type="number" id="periodValue" min="1" value="1" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
              '</div>' +
              
              '<div>' +
                '<label for="periodUnit" class="block text-sm font-medium text-gray-700">周期单位</label>' +
                '<select id="periodUnit" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
                  '<option value="day">天</option>' +
                  '<option value="month" selected>月</option>' +
                  '<option value="year">年</option>' +
                '</select>' +
              '</div>' +
              
              '<div>' +
                '<label for="reminderDays" class="block text-sm font-medium text-gray-700">提前提醒天数</label>' +
                '<input type="number" id="reminderDays" min="0" max="30" value="7" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">' +
              '</div>' +
            '</div>' +
            
            '<div class="mt-2">' +
              '<button type="button" id="calculateExpiryBtn" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">' +
                '<i class="fas fa-calculator mr-2"></i>计算到期日期' +
              '</button>' +
            '</div>' +
          '</div>' +
          
          '<div class="flex justify-end mt-6">' +
            '<button type="submit" id="saveSubscription" class="btn-primary text-white px-4 py-2 rounded-md text-sm font-medium">' +
              '<i class="fas fa-save mr-2"></i>保存' +
            '</button>' +
          '</div>';
        
        document.getElementById('modalTitle').textContent = '编辑订阅';
        document.getElementById('subscriptionId').value = subscription.id;
        document.getElementById('name').value = subscription.name;
        
        // 修复类型回显，优先显示自定义类型，如果没有则显示旧的类型字段
        document.getElementById('customType').value = subscription.customType || subscription.type || '';
        
        document.getElementById('notes').value = subscription.notes || '';
        document.getElementById('isActive').checked = subscription.isActive !== false; // 默认为true
        
        // 设置周期相关字段
        document.getElementById('startDate').value = subscription.startDate ? subscription.startDate.split('T')[0] : '';
        document.getElementById('expiryDate').value = subscription.expiryDate.split('T')[0];
        document.getElementById('periodValue').value = subscription.periodValue || 1;
        document.getElementById('periodUnit').value = subscription.periodUnit || 'month';
        document.getElementById('reminderDays').value = subscription.reminderDays;
        
        // 添加计算到期日期按钮事件
        document.getElementById('calculateExpiryBtn').addEventListener('click', calculateExpiryDate);
        
        // 开始日期和周期值/单位变化时，自动计算
        document.getElementById('startDate').addEventListener('change', calculateExpiryDate);
        document.getElementById('periodValue').addEventListener('change', calculateExpiryDate);
        document.getElementById('periodUnit').addEventListener('change', calculateExpiryDate);
        
        // 重新添加提交事件监听器
        document.getElementById('subscriptionForm').addEventListener('submit', submitHandler);
      } catch (error) {
        console.error('获取订阅详情失败:', error);
        document.getElementById('subscriptionModal').classList.add('hidden');
        alert('获取订阅详情失败，请稍后再试');
      }
    }
    
    // 添加计算到期日期函数
    function calculateExpiryDate() {
      const startDateStr = document.getElementById('startDate').value;
      const periodValue = parseInt(document.getElementById('periodValue').value);
      const periodUnit = document.getElementById('periodUnit').value;
      
      if (!startDateStr || !periodValue) return;
      
      const startDate = new Date(startDateStr);
      let expiryDate = new Date(startDate);
      const today = new Date();
      
      // 首先计算第一个周期的到期日期
      if (periodUnit === 'day') {
        expiryDate.setDate(startDate.getDate() + periodValue);
      } else if (periodUnit === 'month') {
        expiryDate.setMonth(startDate.getMonth() + periodValue);
      } else if (periodUnit === 'year') {
        expiryDate.setFullYear(startDate.getFullYear() + periodValue);
      }
      
      // 如果计算出的到期日期已经过期，则继续计算下一个周期，直到找到未来的日期
      while (expiryDate < today) {
        if (periodUnit === 'day') {
          expiryDate.setDate(expiryDate.getDate() + periodValue);
        } else if (periodUnit === 'month') {
          expiryDate.setMonth(expiryDate.getMonth() + periodValue);
        } else if (periodUnit === 'year') {
          expiryDate.setFullYear(expiryDate.getFullYear() + periodValue);
        }
      }
      
      // 设置日期输入框的值，格式为YYYY-MM-DD
      const expiryDateStr = expiryDate.toISOString().split('T')[0];
      document.getElementById('expiryDate').value = expiryDateStr;
    }
    
    // 声明一个提交处理函数，用于后续重新绑定
    function submitHandler(e) {
      e.preventDefault();
      
      const id = document.getElementById('subscriptionId').value;
      const subscription = {
        name: document.getElementById('name').value,
        customType: document.getElementById('customType').value,
        notes: document.getElementById('notes').value || '',
        isActive: document.getElementById('isActive').checked,
        startDate: document.getElementById('startDate').value,
        expiryDate: document.getElementById('expiryDate').value,
        periodValue: parseInt(document.getElementById('periodValue').value),
        periodUnit: document.getElementById('periodUnit').value,
        reminderDays: parseInt(document.getElementById('reminderDays').value)
      };
      
      // 显示加载状态
      const button = document.getElementById('saveSubscription');
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>保存中...';
      button.disabled = true;
      
      const url = id ? '/api/subscriptions/' + id : '/api/subscriptions';
      const method = id ? 'PUT' : 'POST';
      
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })
      .then(response => {
        if (response.ok) {
          document.getElementById('subscriptionModal').classList.add('hidden');
          loadSubscriptions();
        } else {
          return response.json().then(error => {
            throw new Error(error.message || '未知错误');
          });
        }
      })
      .catch(error => {
        console.error('保存订阅失败:', error);
        alert('保存失败: ' + error.message);
      })
      .finally(() => {
        // 恢复按钮状态
        button.innerHTML = originalContent;
        button.disabled = false;
      });
    }
    
    // 删除订阅
    async function deleteSubscription(e) {
      const id = e.target.dataset.id || e.target.parentElement.dataset.id;
      
      if (!confirm('确定要删除这个订阅吗？')) return;
      
      // 显示加载状态
      const button = e.target.tagName === 'BUTTON' ? e.target : e.target.parentElement;
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>删除中...';
      button.disabled = true;
      
      try {
        const response = await fetch('/api/subscriptions/' + id, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadSubscriptions();
        } else {
          const error = await response.json();
          alert('删除失败: ' + (error.message || '未知错误'));
        }
      } catch (error) {
        console.error('删除订阅失败:', error);
        alert('删除失败，请稍后再试');
        
        // 恢复按钮状态
        button.innerHTML = originalContent;
        button.disabled = false;
      }
    }
    
    // 测试通知
    document.getElementById('testNotificationBtn').addEventListener('click', async () => {
      try {
        // 显示加载状态
        const button = document.getElementById('testNotificationBtn');
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>发送中...';
        button.disabled = true;
        
        const response = await fetch('/api/test-notification', {
          method: 'POST'
        });
        
        const result = await response.json();
        
        // 显示结果
        const resultContent = document.getElementById('notificationResultContent');
        if (result.success) {
          resultContent.innerHTML = '<div class="text-green-500 text-center"><i class="fas fa-check-circle text-4xl mb-2"></i><p>通知发送成功！</p></div>';
        } else {
          resultContent.innerHTML = '<div class="text-red-500 text-center"><i class="fas fa-times-circle text-4xl mb-2"></i><p>通知发送失败：' + (result.message || '未知错误') + '</p></div>';
        }
        
        document.getElementById('notificationResultModal').classList.remove('hidden');
      } catch (error) {
        console.error('测试通知失败:', error);
        alert('测试通知失败，请稍后再试');
      } finally {
        // 恢复按钮状态
        const button = document.getElementById('testNotificationBtn');
        button.innerHTML = '<i class="fas fa-bell mr-2"></i>测试通知';
        button.disabled = false;
      }
    });
    
    // 页面加载完成后获取订阅数据
    window.addEventListener('load', loadSubscriptions);
  </script>
</body>
</html>
`;

// 管理页面
const admin = {
  async handleRequest(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // 检查登录状态
    const token = getCookieValue(request.headers.get('Cookie'), 'token');
    const config = await getConfig(env);
    const user = token ? await verifyJWT(token, config.JWT_SECRET) : null;
    
    if (!user) {
      return new Response('', {
        status: 302,
        headers: { 'Location': '/' }
      });
    }
    
    // 配置页面
    if (pathname === '/admin/config') {
      return new Response(configPage, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // 默认管理页面
    return new Response(adminPage, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

// 配置页面模板
const configPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>系统配置 - 订阅管理系统</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
  <style>
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: all 0.3s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <i class="fas fa-calendar-check text-indigo-600 text-2xl mr-2"></i>
          <span class="font-bold text-xl text-gray-800">订阅管理系统</span>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/admin" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-list mr-1"></i>订阅列表
          </a>
          <a href="/admin/config" class="text-indigo-600 border-b-2 border-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-cog mr-1"></i>系统配置
          </a>
          <a href="/api/logout" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-sign-out-alt mr-1"></i>退出登录
          </a>
        </div>
      </div>
    </div>
  </nav>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">系统配置</h2>
      
      <form id="configForm" class="space-y-6">
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">管理员账户</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="adminUsername" class="block text-sm font-medium text-gray-700">用户名</label>
              <input type="text" id="adminUsername" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="adminPassword" class="block text-sm font-medium text-gray-700">密码</label>
              <input type="password" id="adminPassword" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <p class="mt-1 text-sm text-gray-500">如不修改密码，请留空</p>
            </div>
          </div>
        </div>
        
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Telegram通知配置</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="tgBotToken" class="block text-sm font-medium text-gray-700">Bot Token</label>
              <input type="text" id="tgBotToken" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <p class="mt-1 text-sm text-gray-500">从 @BotFather 获取</p>
            </div>
            <div>
              <label for="tgChatId" class="block text-sm font-medium text-gray-700">Chat ID</label>
              <input type="text" id="tgChatId" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <p class="mt-1 text-sm text-gray-500">可从 @userinfobot 获取</p>
            </div>
          </div>
          <div class="mt-4">
            <button type="button" id="testTelegramBtn" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none">
              <i class="fas fa-paper-plane mr-2"></i>测试Telegram配置
            </button>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button type="submit" class="btn-primary text-white px-6 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-save mr-2"></i>保存配置
          </button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- 测试结果模态框 -->
  <div id="testResultModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">测试结果</h3>
          <button class="testResultClose text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div id="testResultContent" class="py-4"></div>
        
        <div class="flex justify-end">
          <button class="testResultClose btn-primary text-white px-4 py-2 rounded-md text-sm font-medium">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // 加载配置
    async function loadConfig() {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        document.getElementById('adminUsername').value = config.ADMIN_USERNAME || '';
        // 密码不显示，留空
        document.getElementById('tgBotToken').value = config.TG_BOT_TOKEN || '';
        document.getElementById('tgChatId').value = config.TG_CHAT_ID || '';
      } catch (error) {
        console.error('加载配置失败:', error);
        alert('加载配置失败，请刷新页面重试');
      }
    }
    
    // 保存配置
    document.getElementById('configForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const adminPassword = document.getElementById('adminPassword').value;
      
      const config = {
        ADMIN_USERNAME: document.getElementById('adminUsername').value,
        TG_BOT_TOKEN: document.getElementById('tgBotToken').value,
        TG_CHAT_ID: document.getElementById('tgChatId').value
      };
      
      // 只有在填写了密码时才更新密码
      if (adminPassword) {
        config.ADMIN_PASSWORD = adminPassword;
      }
      
      try {
        // 显示加载状态
        const button = e.target.querySelector('button[type="submit"]');
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>保存中...';
        button.disabled = true;
        
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
        
        if (response.ok) {
          alert('配置保存成功');
          // 清空密码字段
          document.getElementById('adminPassword').value = '';
        } else {
          const error = await response.json();
          alert('保存失败: ' + (error.message || '未知错误'));
        }
      } catch (error) {
        console.error('保存配置失败:', error);
        alert('保存配置失败，请稍后再试');
      } finally {
        // 恢复按钮状态
        const button = e.target.querySelector('button[type="submit"]');
        button.innerHTML = '<i class="fas fa-save mr-2"></i>保存配置';
        button.disabled = false;
      }
    });
    
    // 测试Telegram配置
    document.getElementById('testTelegramBtn').addEventListener('click', async () => {
      try {
        const tgBotToken = document.getElementById('tgBotToken').value;
        const tgChatId = document.getElementById('tgChatId').value;
        
        if (!tgBotToken || !tgChatId) {
          alert('请先填写Telegram Bot Token和Chat ID');
          return;
        }
        
        // 显示加载状态
        const button = document.getElementById('testTelegramBtn');
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>测试中...';
        button.disabled = true;
        
        const response = await fetch('/api/test-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            TG_BOT_TOKEN: tgBotToken, 
            TG_CHAT_ID: tgChatId 
          })
        });
        
        const result = await response.json();
        
        // 显示结果
        const resultContent = document.getElementById('testResultContent');
        if (result.success) {
          resultContent.innerHTML = '<div class="text-green-500 text-center"><i class="fas fa-check-circle text-4xl mb-2"></i><p>Telegram配置测试成功！</p></div>';
        } else {
          resultContent.innerHTML = '<div class="text-red-500 text-center"><i class="fas fa-times-circle text-4xl mb-2"></i><p>Telegram配置测试失败：' + (result.message || '未知错误') + '</p></div>';
        }
        
        document.getElementById('testResultModal').classList.remove('hidden');
      } catch (error) {
        console.error('测试Telegram配置失败:', error);
        alert('测试失败，请稍后再试');
      } finally {
        // 恢复按钮状态
        const button = document.getElementById('testTelegramBtn');
        button.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>测试Telegram配置';
        button.disabled = false;
      }
    });
    
    // 关闭测试结果模态框
    document.querySelectorAll('.testResultClose').forEach(el => {
      el.addEventListener('click', () => {
        document.getElementById('testResultModal').classList.add('hidden');
      });
    });
    
    // 点击模态框外部关闭
    document.getElementById('testResultModal').addEventListener('click', (event) => {
      if (event.target === document.getElementById('testResultModal')) {
        document.getElementById('testResultModal').classList.add('hidden');
      }
    });
    
    // 页面加载完成后获取配置
    window.addEventListener('load', loadConfig);
  </script>
</body>
</html>
`;

// 处理API请求
const api = {
  async handleRequest(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.slice(4); // 移除开头的 '/api'
    const method = request.method;
    
    // 获取配置信息
    const config = await getConfig(env);
    
    // 登录API
    if (path === '/login' && method === 'POST') {
      const body = await request.json();
      
      if (body.username === config.ADMIN_USERNAME && body.password === config.ADMIN_PASSWORD) {
        const token = await generateJWT(body.username, config.JWT_SECRET);
        
        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': `token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`
            }
          }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, message: '用户名或密码错误' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // 登出API
    if (path === '/logout' && (method === 'GET' || method === 'POST')) {
      return new Response('', {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': 'token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'
        }
      });
    }
    
    // 以下接口需要验证
    const token = getCookieValue(request.headers.get('Cookie'), 'token');
    const user = token ? await verifyJWT(token, config.JWT_SECRET) : null;
    
    if (!user && path !== '/login') {
      return new Response(
        JSON.stringify({ success: false, message: '未授权访问' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 配置API
    if (path === '/config') {
      // 获取配置
      if (method === 'GET') {
        // 返回配置信息，但不包含敏感的JWT密钥
        const { JWT_SECRET, ...safeConfig } = config;
        
        return new Response(
          JSON.stringify(safeConfig),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // 更新配置
      if (method === 'POST') {
        try {
          const newConfig = await request.json();
          
          // 合并配置，保留JWT_SECRET
          const updatedConfig = { 
            ...config,
            ADMIN_USERNAME: newConfig.ADMIN_USERNAME || config.ADMIN_USERNAME,
            TG_BOT_TOKEN: newConfig.TG_BOT_TOKEN || config.TG_BOT_TOKEN,
            TG_CHAT_ID: newConfig.TG_CHAT_ID || config.TG_CHAT_ID
          };
          
          // 如果提供了新密码则更新
          if (newConfig.ADMIN_PASSWORD) {
            updatedConfig.ADMIN_PASSWORD = newConfig.ADMIN_PASSWORD;
          }
          
          // 保存更新后的配置
          await env.SUBSCRIPTIONS_KV.put('config', JSON.stringify(updatedConfig));
          
          return new Response(
            JSON.stringify({ success: true }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, message: '更新配置失败' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    // 测试Telegram配置API
    if (path === '/test-telegram' && method === 'POST') {
      try {
        const { TG_BOT_TOKEN, TG_CHAT_ID } = await request.json();
        
        if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
          return new Response(
            JSON.stringify({ success: false, message: 'Telegram配置不完整' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        const message = '*Telegram配置测试*\n\n这是一条测试消息，如果您收到这条消息，说明Telegram配置正确。\n\n发送时间: ' + new Date().toLocaleString();
        
        const testConfig = {
          ...config,
          TG_BOT_TOKEN,
          TG_CHAT_ID
        };
        
        const success = await sendTelegramNotification(message, testConfig);
        
        return new Response(
          JSON.stringify({ 
            success,
            message: success ? 'Telegram配置测试成功' : 'Telegram配置测试失败，请检查Bot Token和Chat ID'
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, message: '测试Telegram配置失败' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // 测试通知API
    if (path === '/test-notification' && method === 'POST') {
      const message = '*测试通知*\n\n这是一条测试通知，用于验证通知功能是否正常工作。\n\n发送时间: ' + new Date().toLocaleString();
      
      const success = await sendTelegramNotification(message, config);
      
      return new Response(
        JSON.stringify({ 
          success,
          message: success ? '通知发送成功' : '通知发送失败，请检查Telegram Bot配置'
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 订阅相关API
    if (path === '/subscriptions') {
      // 获取所有订阅
      if (method === 'GET') {
        const subscriptions = await getAllSubscriptions(env);
        return new Response(
          JSON.stringify(subscriptions),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // 创建新订阅
      if (method === 'POST') {
        const subscription = await request.json();
        const result = await createSubscription(subscription, env);
        
        return new Response(
          JSON.stringify(result),
          { 
            status: result.success ? 201 : 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // 订阅详情API
    if (path.match(/^\/subscriptions\/[a-zA-Z0-9-]+$/)) {
      const id = path.split('/')[2];
      
      // 获取单个订阅
      if (method === 'GET') {
        const subscription = await getSubscription(id, env);
        
        if (subscription) {
          return new Response(
            JSON.stringify(subscription),
            { headers: { 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ message: '订阅不存在' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // 更新订阅
      if (method === 'PUT') {
        const subscription = await request.json();
        const result = await updateSubscription(id, subscription, env);
        
        return new Response(
          JSON.stringify(result),
          { 
            status: result.success ? 200 : 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // 删除订阅
      if (method === 'DELETE') {
        const result = await deleteSubscription(id, env);
        
        return new Response(
          JSON.stringify(result),
          { 
            status: result.success ? 200 : 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // 切换订阅状态API
    if (path.match(/^\/subscriptions\/[a-zA-Z0-9-]+\/toggle-status$/)) {
      const id = path.split('/')[2];
      
      if (method === 'POST') {
        const body = await request.json();
        const isActive = !!body.isActive;
        
        const result = await toggleSubscriptionStatus(id, isActive, env);
        
        return new Response(
          JSON.stringify(result),
          { 
            status: result.success ? 200 : 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // 如果没有匹配的路由
    return new Response(
      JSON.stringify({ message: '接口不存在' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 从KV中获取配置
async function getConfig(env) {
  try {
    const configData = await env.SUBSCRIPTIONS_KV.get('config');
    
    if (configData) {
      return JSON.parse(configData);
    } else {
      // 默认配置
      const defaultConfig = {
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'password',
        TG_BOT_TOKEN: '',
        TG_CHAT_ID: '',
        JWT_SECRET: 'default-jwt-secret-' + Math.random().toString(36).substring(2)
      };
      
      // 保存默认配置到KV
      await env.SUBSCRIPTIONS_KV.put('config', JSON.stringify(defaultConfig));
      
      return defaultConfig;
    }
  } catch (error) {
    console.error('获取配置失败:', error);
    
    // 返回备用配置
    return {
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'password',
      TG_BOT_TOKEN: '',
      TG_CHAT_ID: '',
      JWT_SECRET: 'fallback-jwt-secret'
    };
  }
}

// JWT相关函数
async function generateJWT(username, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24小时过期
  };
  
  const base64UrlEncode = str => {
    return btoa(str)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };
  
  const headerStr = JSON.stringify(header);
  const payloadStr = JSON.stringify(payload);
  
  const headerB64 = base64UrlEncode(headerStr);
  const payloadB64 = base64UrlEncode(payloadStr);
  
  const signature = await CryptoJS.HmacSHA256(`${headerB64}.${payloadB64}`, secret);
  const signatureB64 = base64UrlEncode(signature);
  
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // 检查是否过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

// 订阅相关的数据访问函数
async function getAllSubscriptions(env) {
  try {
    const data = await env.SUBSCRIPTIONS_KV.get('subscriptions');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

async function getSubscription(id, env) {
  const subscriptions = await getAllSubscriptions(env);
  return subscriptions.find(s => s.id === id);
}

async function createSubscription(subscription, env) {
  try {
    const subscriptions = await getAllSubscriptions(env);
    
    // 验证必填字段
    if (!subscription.name || !subscription.expiryDate) {
      return { success: false, message: '缺少必填字段' };
    }
    
    // 确保到期日期是未来的日期
    let expiryDate = new Date(subscription.expiryDate);
    const now = new Date();
    
    // 如果有周期设置且到期日期已过期，计算到未来的周期
    if (expiryDate < now && subscription.periodValue && subscription.periodUnit) {
      while (expiryDate < now) {
        if (subscription.periodUnit === 'day') {
          expiryDate.setDate(expiryDate.getDate() + subscription.periodValue);
        } else if (subscription.periodUnit === 'month') {
          expiryDate.setMonth(expiryDate.getMonth() + subscription.periodValue);
        } else if (subscription.periodUnit === 'year') {
          expiryDate.setFullYear(expiryDate.getFullYear() + subscription.periodValue);
        }
      }
      subscription.expiryDate = expiryDate.toISOString();
    }
    
    const newSubscription = {
      id: Date.now().toString(),
      name: subscription.name,
      customType: subscription.customType || '',
      startDate: subscription.startDate || null,
      expiryDate: subscription.expiryDate,
      periodValue: subscription.periodValue || 1,
      periodUnit: subscription.periodUnit || 'month',
      reminderDays: subscription.reminderDays || 7,
      notes: subscription.notes || '',
      isActive: subscription.isActive !== false, // 默认为true
      createdAt: new Date().toISOString()
    };
    
    subscriptions.push(newSubscription);
    
    await env.SUBSCRIPTIONS_KV.put('subscriptions', JSON.stringify(subscriptions));
    
    return { success: true, subscription: newSubscription };
  } catch (error) {
    return { success: false, message: '创建订阅失败' };
  }
}

async function updateSubscription(id, subscription, env) {
  try {
    const subscriptions = await getAllSubscriptions(env);
    const index = subscriptions.findIndex(s => s.id === id);
    
    if (index === -1) {
      return { success: false, message: '订阅不存在' };
    }
    
    // 验证必填字段
    if (!subscription.name || !subscription.expiryDate) {
      return { success: false, message: '缺少必填字段' };
    }
    
    // 确保到期日期是未来的日期
    let expiryDate = new Date(subscription.expiryDate);
    const now = new Date();
    
    // 如果有周期设置且到期日期已过期，计算到未来的周期
    if (expiryDate < now && subscription.periodValue && subscription.periodUnit) {
      while (expiryDate < now) {
        if (subscription.periodUnit === 'day') {
          expiryDate.setDate(expiryDate.getDate() + subscription.periodValue);
        } else if (subscription.periodUnit === 'month') {
          expiryDate.setMonth(expiryDate.getMonth() + subscription.periodValue);
        } else if (subscription.periodUnit === 'year') {
          expiryDate.setFullYear(expiryDate.getFullYear() + subscription.periodValue);
        }
      }
      subscription.expiryDate = expiryDate.toISOString();
    }
    
    subscriptions[index] = {
      ...subscriptions[index],
      name: subscription.name,
      customType: subscription.customType || subscriptions[index].customType || '',
      startDate: subscription.startDate || subscriptions[index].startDate,
      expiryDate: subscription.expiryDate,
      periodValue: subscription.periodValue || subscriptions[index].periodValue || 1,
      periodUnit: subscription.periodUnit || subscriptions[index].periodUnit || 'month',
      reminderDays: subscription.reminderDays || 7,
      notes: subscription.notes || '',
      isActive: subscription.isActive !== undefined ? subscription.isActive : subscriptions[index].isActive,
      updatedAt: new Date().toISOString()
    };
    
    await env.SUBSCRIPTIONS_KV.put('subscriptions', JSON.stringify(subscriptions));
    
    return { success: true, subscription: subscriptions[index] };
  } catch (error) {
    return { success: false, message: '更新订阅失败' };
  }
}

async function deleteSubscription(id, env) {
  try {
    const subscriptions = await getAllSubscriptions(env);
    const filteredSubscriptions = subscriptions.filter(s => s.id !== id);
    
    if (filteredSubscriptions.length === subscriptions.length) {
      return { success: false, message: '订阅不存在' };
    }
    
    await env.SUBSCRIPTIONS_KV.put('subscriptions', JSON.stringify(filteredSubscriptions));
    
    return { success: true };
  } catch (error) {
    return { success: false, message: '删除订阅失败' };
  }
}

async function toggleSubscriptionStatus(id, isActive, env) {
  try {
    const subscriptions = await getAllSubscriptions(env);
    const index = subscriptions.findIndex(s => s.id === id);
    
    if (index === -1) {
      return { success: false, message: '订阅不存在' };
    }
    
    subscriptions[index] = {
      ...subscriptions[index],
      isActive: isActive,
      updatedAt: new Date().toISOString()
    };
    
    await env.SUBSCRIPTIONS_KV.put('subscriptions', JSON.stringify(subscriptions));
    
    return { success: true, subscription: subscriptions[index] };
  } catch (error) {
    return { success: false, message: '更新订阅状态失败' };
  }
}

// Telegram通知功能
async function sendTelegramNotification(message, config) {
  try {
    // 检查是否配置了Telegram通知
    if (!config.TG_BOT_TOKEN || !config.TG_CHAT_ID) {
      console.error('[Telegram] 通知未配置，缺少Bot Token或Chat ID');
      return false;
    }
    
    console.log(`[Telegram] 开始发送通知到 Chat ID: ${config.TG_CHAT_ID}`);
    
    const url = `https://api.telegram.org/bot${config.TG_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.TG_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    const result = await response.json();
    console.log(`[Telegram] 发送结果:`, result);
    return result.ok;
  } catch (error) {
    console.error('[Telegram] 发送通知失败:', error);
    return false;
  }
}

// 定时检查即将到期的订阅 - 更新以支持isActive字段
async function checkExpiringSubscriptions(env) {
  try {
    console.log('[定时任务] 开始检查即将到期的订阅: ' + new Date().toISOString());
    
    const subscriptions = await getAllSubscriptions(env);
    console.log(`[定时任务] 共找到 ${subscriptions.length} 个订阅`);
    
    const config = await getConfig(env);
    const now = new Date();
    const expiringSubscriptions = [];
    const updatedSubscriptions = [];
    let hasUpdates = false;
    
    for (const subscription of subscriptions) {
      // 跳过已停用的订阅
      if (subscription.isActive === false) {
        console.log(`[定时任务] 订阅 "${subscription.name}" 已停用，跳过`);
        continue;
      }
      
      const expiryDate = new Date(subscription.expiryDate);
      const daysDiff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      console.log(`[定时任务] 订阅 "${subscription.name}" 到期日期: ${expiryDate.toISOString()}, 剩余天数: ${daysDiff}`);
      
      // 如果已过期，且设置了周期，则自动更新到下一个周期
      if (daysDiff < 0 && subscription.periodValue && subscription.periodUnit) {
        console.log(`[定时任务] 订阅 "${subscription.name}" 已过期，正在更新到下一个周期`);
        
        const newExpiryDate = new Date(expiryDate);
        
        // 计算下一个周期的到期日期
        if (subscription.periodUnit === 'day') {
          newExpiryDate.setDate(expiryDate.getDate() + subscription.periodValue);
        } else if (subscription.periodUnit === 'month') {
          newExpiryDate.setMonth(expiryDate.getMonth() + subscription.periodValue);
        } else if (subscription.periodUnit === 'year') {
          newExpiryDate.setFullYear(expiryDate.getFullYear() + subscription.periodValue);
        }
        
        // 检查新的到期日期是否仍然过期，如果是则继续计算下一个周期，直到找到未来的日期
        while (newExpiryDate < now) {
          console.log(`[定时任务] 新计算的到期日期 ${newExpiryDate.toISOString()} 仍然过期，继续计算下一个周期`);
          
          if (subscription.periodUnit === 'day') {
            newExpiryDate.setDate(newExpiryDate.getDate() + subscription.periodValue);
          } else if (subscription.periodUnit === 'month') {
            newExpiryDate.setMonth(newExpiryDate.getMonth() + subscription.periodValue);
          } else if (subscription.periodUnit === 'year') {
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + subscription.periodValue);
          }
        }
        
        console.log(`[定时任务] 订阅 "${subscription.name}" 更新到期日期: ${newExpiryDate.toISOString()}`);
        
        // 更新订阅的到期日期
        const updatedSubscription = { ...subscription, expiryDate: newExpiryDate.toISOString() };
        updatedSubscriptions.push(updatedSubscription);
        hasUpdates = true;
        
        // 使用更新后的到期日期重新计算天数差
        const newDaysDiff = Math.ceil((newExpiryDate - now) / (1000 * 60 * 60 * 24));
        
        // 如果新的到期日期在提醒范围内，添加到提醒列表
        if (newDaysDiff <= subscription.reminderDays) {
          console.log(`[定时任务] 订阅 "${subscription.name}" 在提醒范围内，将发送通知`);
          expiringSubscriptions.push({
            ...updatedSubscription,
            daysRemaining: newDaysDiff
          });
        }
      } else if (daysDiff <= subscription.reminderDays && daysDiff >= 0) {
        // 如果在提醒范围内但未过期，正常添加到提醒列表
        console.log(`[定时任务] 订阅 "${subscription.name}" 在提醒范围内，将发送通知`);
        expiringSubscriptions.push({
          ...subscription,
          daysRemaining: daysDiff
        });
      }
    }
    
    // 如果有更新的订阅，保存到KV存储
    if (hasUpdates) {
      console.log(`[定时任务] 有 ${updatedSubscriptions.length} 个订阅需要更新到下一个周期`);
      
      // 将更新后的订阅合并回原始列表
      const mergedSubscriptions = subscriptions.map(sub => {
        const updated = updatedSubscriptions.find(u => u.id === sub.id);
        return updated || sub;
      });
      
      await env.SUBSCRIPTIONS_KV.put('subscriptions', JSON.stringify(mergedSubscriptions));
      console.log(`[定时任务] 已更新订阅列表`);
    }
    
    // 发送Telegram通知
    if (expiringSubscriptions.length > 0) {
      console.log(`[定时任务] 有 ${expiringSubscriptions.length} 个订阅需要发送通知`);
      
      let message = '*订阅到期提醒*\n\n';
      
      for (const subscription of expiringSubscriptions) {
        // 使用自定义类型
        const typeText = subscription.customType || '其他';
        
        // 周期信息
        let periodText = '';
        if (subscription.periodValue && subscription.periodUnit) {
          const unitMap = { day: '天', month: '月', year: '年' };
          periodText = `(周期: ${subscription.periodValue} ${unitMap[subscription.periodUnit] || subscription.periodUnit})`;
        }
        
        if (subscription.daysRemaining === 0) {
          message += `⚠️ *${subscription.name}* (${typeText}) ${periodText} 今天到期！\n`;
        } else {
          message += `📅 *${subscription.name}* (${typeText}) ${periodText} 将在 ${subscription.daysRemaining} 天后到期\n`;
        }
        
        if (subscription.notes) {
          message += `备注: ${subscription.notes}\n`;
        }
        
        message += '\n';
      }
      
      const success = await sendTelegramNotification(message, config);
      console.log(`[定时任务] 发送通知 ${success ? '成功' : '失败'}`);
    } else {
      console.log(`[定时任务] 没有需要提醒的订阅`);
    }
    
    console.log('[定时任务] 检查完成');
  } catch (error) {
    console.error('[定时任务] 检查即将到期的订阅失败:', error);
  }
}

// 辅助函数
function getCookieValue(cookieString, key) {
  if (!cookieString) return null;
  
  const match = cookieString.match(new RegExp(`(^| )${key}=([^;]+)`));
  return match ? match[2] : null;
}

// 主页面处理
async function handleRequest(request, env, ctx) {
  return new Response(loginPage, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// CryptoJS简化版实现
const CryptoJS = {
  HmacSHA256: function(message, key) {
    // 使用TextEncoder创建编码数据
    const keyData = new TextEncoder().encode(key);
    const messageData = new TextEncoder().encode(message);
    
    // 使用Promise.resolve包装，以避免await问题
    return Promise.resolve().then(() => {
      // 使用crypto.subtle API创建HMAC签名
      return crypto.subtle.importKey(
        "raw", 
        keyData,
        { name: "HMAC", hash: {name: "SHA-256"} },
        false,
        ["sign"]
      );
    }).then(cryptoKey => {
      return crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        messageData
      );
    }).then(buffer => {
      // 转换为十六进制字符串
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    });
  }
};

// 导出主模块
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api')) {
      return api.handleRequest(request, env, ctx);
    } else if (url.pathname.startsWith('/admin')) {
      return admin.handleRequest(request, env, ctx);
    } else {
      return handleRequest(request, env, ctx);
    }
  },
  
  async scheduled(event, env, ctx) {
    // 每天定时检查即将到期的订阅
    console.log('[Workers] 定时任务触发时间:', new Date().toISOString());
    await checkExpiringSubscriptions(env);
  }
}