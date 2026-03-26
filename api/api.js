import { ref } from 'vue'
import { useUserStore } from '@/store/userStore'
export const useApi = () => {
  const userStore = useUserStore();
  const serverUrl = ref('http://localhost:5000/api');

  // 发送 GET 请求
  const get = async (endpoint, params ,testUrl) => {
    try {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      let url;
      if(testUrl){
        url=`${testUrl}/${endpoint}${queryParams}`
      }else{
        url=`${serverUrl.value}/${endpoint}${queryParams}`
      }
      const headers= {
        'Content-Type': 'application/json',
      };
      
      // 添加Authorization头到GET请求
      if (userStore.User) {
        headers['Authorization'] = `Bearer ${userStore.User}`;
      }
      
      const response=uni.request({
        url: url,
        method: 'GET',
        header: headers,
      })
      if(!response.ok){
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('GET Request Error:', error);
      throw error;
    }
  };

  const post = async (endpoint, data,testUrl) => {
    // 对于登录和注册请求，跳过用户验证
    const isAuthEndpoint = endpoint === 'login' || endpoint === 'register'||endpoint==='sendEmailCode';


    // 检查用户是否登录（非登录/注册请求时）
    if (!isAuthEndpoint && !userStore.isLoggedIn) {
      router.push('/login');
      throw new Error('User not logged in');
    }
    let url;
    if(testUrl){
      url=`${testUrl}/${endpoint}`
    }else{
      url=`${serverUrl.value}/${endpoint}`
    }
    try {
      const headers= {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // 添加Authorization头（非登录/注册请求时）
      if (!isAuthEndpoint && userStore.currentUser) {
        headers['Authorization'] = `Bearer ${userStore.currentUser}`;
      }
      
      const response=uni.request({
        url: url,
        method: 'POST',
        header: headers,
        body: JSON.stringify(isAuthEndpoint ? data : data),
      })
      console.log(response)
      
      if (!response.ok) {
        // 如果是未授权错误或会话过期，跳转到登录页面
        if (response.status === 401 || response.status === 403) {
          userStore.logout();  // 清除本地登录状态
          router.push('/login');
          throw new Error('Session expired or unauthorized');
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {  // 明确指定 error 类型为 any
      console.error('POST Request Error:', error);
      // 如果错误消息包含特定关键词，也跳转到登录页面
      if (typeof error.message === 'string' && (
          error.message.toLowerCase().includes('unauthorized') || 
          error.message.toLowerCase().includes('unauthenticated') ||
          error.message.toLowerCase().includes('session'))) {
        userStore.logout();  // 清除本地登录状态
        router.push('/login');
      }
      throw error;
    }
  };

const postFile = async (endpoint, formData,testUrl) => {
  try {
    let url;
    if(testUrl){
      url=`${testUrl}/${endpoint}`
    }else{
      url=`${serverUrl.value}/${endpoint}`
    }
    
    const headers= {
      'Accept': 'application/json',//不需要手动设置multipart/form-data让浏览器自己生成boundary
    };
    
    // 添加Authorization头
    if (userStore.currentUser) {
      headers['Authorization'] = `Bearer ${userStore.currentUser}`;
    }
    
    const response=uni.request({
      url: url,
      method: "POST",
      body: formData, // 只支持 FormData
      header: headers,
    })

    const result = await response.json();
    return result;
  } catch (error) {
    console.error( error);
  }
};

  return { 
    serverUrl, 
    get, 
    post, 
    postFile,
  };
};


export default useApi;