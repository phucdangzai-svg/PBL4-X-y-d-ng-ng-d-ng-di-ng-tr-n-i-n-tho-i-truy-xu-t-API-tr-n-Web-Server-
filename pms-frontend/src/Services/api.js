const API_URL = "http://localhost:3000/api/v1";

// Dùng chung một lần refresh nếu nhiều request cùng hết hạn
let refreshPromise = null;

// Xóa thông tin đăng nhập và chuyển về trang login
const handleSessionExpired = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  window.location.href = "/login";
};

// Lấy Access Token mới bằng Refresh Token
const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("Không tìm thấy Refresh Token");
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Refresh Token không hợp lệ");
      }

      const newAccessToken = result.data.accessToken;

      localStorage.setItem("accessToken", newAccessToken);

      return newAccessToken;
    })();
  }

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

// Hàm gọi API dùng chung
const request = async (endpoint, options = {}) => {
  let token = localStorage.getItem("accessToken");

  // Gửi request với token hiện tại
  const sendRequest = (accessToken) => {
    const isFormData = options.body instanceof FormData;

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });
  };

  let response = await sendRequest(token);

  // Nếu Access Token hết hạn thì tự động refresh
  if (response.status === 401 && token) {
    try {
      // Nếu request khác đã refresh trước đó thì dùng token mới
      const currentToken = localStorage.getItem("accessToken");

      if (currentToken !== token && currentToken) {
        token = currentToken;
      } else {
        token = await refreshAccessToken();
      }

      // Gửi lại request ban đầu với Access Token mới
      response = await sendRequest(token);
    } catch (error) {
      handleSessionExpired();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    // Nếu token mới vẫn bị từ chối
    if (response.status === 401) {
      handleSessionExpired();
      throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
    }
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Có lỗi xảy ra");
  }

  return result;
};

// ================= AUTH API =================

// Đăng nhập
export const loginApi = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Đăng nhập thất bại");
  }

  return result.data;
};

// ================= ROOM API =================

// Lấy danh sách phòng
export const getRoomsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();

  return request(`/rooms${query ? `?${query}` : ""}`);
};

// Tạo phòng (có thể kèm ảnh)
export const createRoomApi = async (roomData, imageFile = null) => {
  let body;

  if (imageFile) {
    body = new FormData();

    Object.entries(roomData).forEach(([key, value]) => {
      body.append(key, value ?? "");
    });

    body.append("image", imageFile);
  } else {
    body = JSON.stringify(roomData);
  }

  return request("/rooms", {
    method: "POST",
    body,
  });
};

// Cập nhật phòng (có thể kèm ảnh mới)
export const updateRoomApi = async (id, roomData, imageFile = null) => {
  let body;

  if (imageFile) {
    body = new FormData();

    Object.entries(roomData).forEach(([key, value]) => {
      body.append(key, value ?? "");
    });

    body.append("image", imageFile);
  } else {
    body = JSON.stringify(roomData);
  }

  return request(`/rooms/${id}`, {
    method: "PUT",
    body,
  });
};

// Xóa phòng
export const deleteRoomApi = async (id) => {
  return request(`/rooms/${id}`, {
    method: "DELETE",
  });
};

// ================= ROOM TYPE API =================

// Lấy danh sách loại phòng
export const getRoomTypesApi = async () => {
  return request("/room-types");
};

// Lấy chi tiết loại phòng
export const getRoomTypeByIdApi = async (id) => {
  return request(`/room-types/${id}`);
};

// Thêm loại phòng
export const createRoomTypeApi = async (roomTypeData) => {
  return request("/room-types", {
    method: "POST",
    body: JSON.stringify(roomTypeData),
  });
};

// Cập nhật loại phòng
export const updateRoomTypeApi = async (id, roomTypeData) => {
  return request(`/room-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(roomTypeData),
  });
};

// Xóa loại phòng
export const deleteRoomTypeApi = async (id) => {
  return request(`/room-types/${id}`, {
    method: "DELETE",
  });
};

// ================= CUSTOMER API =================

// Lấy danh sách khách hàng
export const getCustomersApi = async () => {
  return request("/customers");
};

// Lấy chi tiết khách hàng
export const getCustomerByIdApi = async (id) => {
  return request(`/customers/${id}`);
};

// Thêm khách hàng
export const createCustomerApi = async (customerData) => {
  return request("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
};

// Cập nhật khách hàng
export const updateCustomerApi = async (id, customerData) => {
  return request(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customerData),
  });
};

// Xóa khách hàng
export const deleteCustomerApi = async (id) => {
  return request(`/customers/${id}`, {
    method: "DELETE",
  });
};

// ================= BOOKING API =================

// Lấy danh sách booking
export const getBookingsApi = async () => {
  return request("/bookings");
};

// Lấy chi tiết booking
export const getBookingByIdApi = async (id) => {
  return request(`/bookings/${id}`);
};

// Tạo booking
export const createBookingApi = async (bookingData) => {
  return request("/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
};

// Cập nhật trạng thái booking
export const updateBookingStatusApi = async (id, status) => {
  return request(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

// ================= DASHBOARD API =================

export const getDashboardOverviewApi = async (period = "7days") => {
  return request(`/dashboard/overview?period=${period}`);
};
// ================= CHANNEL MANAGER API =================

// Lấy danh sách kênh OTA
export const getChannelsApi = async () => {
  return request("/channel-manager/channels");
};

// Bật / tắt kênh OTA
export const updateChannelStatusApi = async (id, status) => {
  return request(`/channel-manager/channels/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

// Lấy danh sách Room Mapping
export const getMappingsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();

  return request(`/channel-manager/mappings${query ? `?${query}` : ""}`);
};

// Thêm Room Mapping
export const createMappingApi = async (mappingData) => {
  return request("/channel-manager/mappings", {
    method: "POST",
    body: JSON.stringify(mappingData),
  });
};

// Cập nhật Room Mapping
export const updateMappingApi = async (id, mappingData) => {
  return request(`/channel-manager/mappings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(mappingData),
  });
};

// Xóa Room Mapping
export const deleteMappingApi = async (id) => {
  return request(`/channel-manager/mappings/${id}`, {
    method: "DELETE",
  });
};

// Lấy lịch sử đồng bộ
export const getSyncLogsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();

  return request(`/channel-manager/sync-logs${query ? `?${query}` : ""}`);
};
