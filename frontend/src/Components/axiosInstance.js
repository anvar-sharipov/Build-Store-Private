// import axios from 'axios';


// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:8000/api/',
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('access')}`,
//     'Content-Type': 'application/json',
//     accept: 'application/json',
//   },
// });

// axiosInstance.interceptors.request.use(
//   config => {
//     const token = localStorage.getItem('access');
//     if (token) {
//       config.headers['Authorization'] = 'Bearer ' + token;
//     }
//     return config;
//   },
//   error => Promise.reject(error)
// );

// axiosInstance.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const refreshToken = localStorage.getItem('refresh');

//       if (refreshToken) {
//         try {
//           // Обновляем токены
//           const response = await axios.post('http://localhost:8000/api/token/refresh/', { refresh: refreshToken });

//           const newAccessToken = response.data.access;
          

//           // Если сервер вернул новый refresh токен — обновляем его
//           if (response.data.refresh) {
//             localStorage.setItem('refresh', response.data.refresh);
//           }

//           localStorage.setItem('access', newAccessToken);

//           // Обновляем заголовок и повторяем запрос
//           originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
//           return axiosInstance(originalRequest);
//         } catch (err) {

          
//           // Токен обновления истек или недействителен — очищаем и редиректим
//           localStorage.removeItem('access');
//           localStorage.removeItem('refresh');
//           window.location.href = '/login';
//           return Promise.reject(err);
//         }
//       } else {
//         // Нет refresh токена — редирект
//         window.location.href = '/login';
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
