import instance from "@/utils/axios.utils";


const dashboard = {
    dashboard: (body) => {
  let promise = new Promise((resolve, reject) => {
    let url = `dashboard`;

    const params = new URLSearchParams();

    if (body?.date_filter) {
      params.append("date_filter", body.date_filter);
    }

    if (body?.from_date) {
      params.append("from_date", body.from_date);
    }

    if (body?.to_date) {
      params.append("to_date", body.to_date);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    instance()
      .get(url)
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        if (error.response) {
          reject(error.response.data?.message || error.response.message);
        } else {
          reject(error);
        }
      });
  });

  return promise;
},
}

export default dashboard;