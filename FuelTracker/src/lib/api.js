// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
//   withCredentials: true,
//   headers: { "Content-Type": "application/json" },
// });

// export default api;

//not use
// import axios from "axios";
// import * as mock from "../mocks/mockApi";

// const useMock = import.meta.env.VITE_MOCK_API === "true";

// if (useMock) {
//   // Drop-in mock with same API as axios (get/post/put/delete)
//   // Keeps data in localStorage and simulates latency
//   // See ../mocks/mockApi.js
//   // Export the mock methods to look like axios
//   export default mock;
// } else {
//   const api = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
//     withCredentials: true,
//     headers: { "Content-Type": "application/json" },
//   });
//   export default api;
// }

//WORKING
// src/lib/api.js
// import axios from "axios";
// import * as mock from "../mocks/mockApi";

// const useMock = import.meta.env.VITE_MOCK_API === "true";

// let api;
// if (useMock) {
//   api = mock; // drop-in: get/post/put/delete
// } else {
//   api = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
//     withCredentials: true,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// console.log(
//   "[API]",
//   useMock ? "MOCK" : "REAL",
//   import.meta.env.VITE_API_BASE_URL
// );
// export default api;

import axios from "axios";
import mock from "../mocks/mockApi";

const useMock = import.meta.env.VITE_MOCK_API === "true";

let api;
if (useMock) {
  api = mock; // drop-in: get/post/put/delete
} else {
  api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
}

console.log(
  "[API]",
  useMock ? "MOCK" : "REAL",
  import.meta.env.VITE_API_BASE_URL
);

export default api;
