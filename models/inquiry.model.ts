import instance from "@/utils/axios.utils";

const inquiry = {
  callback: (page: any, body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `callbacks/?page=${page}`;
      if(body?.developer_user) {
        url += `&developer_id=${body?.developer_user}`;
      }
      if (body?.search) {
        url += `&search=${body?.search}`;
      }
      if (body?.date) {
        url += `&date=${body?.date}`;
      }
      if (body?.from_date) {
        url += `&date_from=${body?.from_date}`;
      }
      if (body?.to_date) {
        url += `&date_to=${body?.to_date}`;
      }
      if (body?.ordering) {
        url += `&ordering=${body?.ordering}`;
      }

      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  booking_inquiry: (page: any, body: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `apartment-callbacks/?page=${page}`;
      if(body?.developer_user) {
        url += `&developer_id=${body?.developer_user}`;
      }
      if (body?.search) {
        url += `&search=${body?.search}`;
      }
      if (body?.pagination == "No") {
        url += `&pagination=${false}`;
      }
      if (body?.date) {
        url += `&date=${body?.date}`;
      }
      if (body?.from_date) {
        url += `&date_from=${body?.from_date}`;
      }
      if (body?.to_date) {
        url += `&date_to=${body?.to_date}`;
      }
      if (body?.ordering) {
        url += `&ordering=${body?.ordering}`;
      }
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  callback_view: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `callbacks/${id}/`;

      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  booking_view: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `apartment-callbacks/${id}/`;

      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  callback_delete: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `callbacks/${id}/`;

      instance()
        .delete(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  booking_delete: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `apartment-callbacks/${id}/`;

      instance()
        .delete(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response?.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },
};

export default inquiry;
