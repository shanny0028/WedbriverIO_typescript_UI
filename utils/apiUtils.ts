// utils/apiUtils.ts
import axios, { AxiosRequestConfig, AxiosRequestHeaders,AxiosInstance, AxiosResponse } from "axios";
import https from 'https';

const insecureAgent = new https.Agent({ rejectUnauthorized: false });
/*
 * Performs a GET API request using the provided URL and headers.
 * Used to retrieve data from an API endpoint.
 */

export const getApiRequest = async (url: string, headers?: AxiosRequestHeaders) => {
  try {
    const response = await axios.get(url, {
      headers: headers || {
        Authorization: "2b840eecaf1e409eac008d3890a6e0db"
      }
    });
    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};


/*
 * Performs a POST API request using the specified URL, headers, and payload.
 * Used to send data to an API endpoint.
 */
export const postApiRequest = async(url: string, headers: object,payload: object = {}): Promise<any> =>{
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL certificate validation
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: url,
    data: payload,
    headers: headers,
    httpsAgent: httpsAgent
  };
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("Error making POST request:", error);
    throw error;
  }
}

export const specialPostApiRequest =async(url: string, headers: object,payload: object | string = {},useCredentials: boolean = true,customClient?: AxiosInstance): Promise<AxiosResponse<any>> =>{
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL certificate validation
  });

  const config: AxiosRequestConfig = {
    method: "post",
    url: url,
    data: payload,
    headers: headers,
    httpsAgent: httpsAgent,
    maxRedirects: 0,
    validateStatus: function (status: number) {
      return status >= 200 && status < 400; // Treat 3xx as successful
    },
  };

if (useCredentials) {
  config.withCredentials = true;
}
const client = customClient || axios

  try {
    const response = await client(config);
    return response;
    
  } catch (error) {
    console.error("Error making POST request:", error);
    // throw error;
  }
}

export const specialGetApiRequest =async(url: string, headers: object = {},useCredentials: boolean = true): Promise<any> =>{
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL certificate validation
  });

  const config: AxiosRequestConfig = {
    method: "get",
    url: url,
    headers: headers,
    httpsAgent: httpsAgent,
    maxRedirects: 0,
    validateStatus: function (status: number) {
      return status >= 200 && status < 400; // Treat 3xx as successful
    },
  };
  if (useCredentials) {
    config.withCredentials = true;
  }

  try {
    const response = await axios(config);
    return response;
    
  } catch (error) {
    console.error("Error making POST request:", error);
    // throw error;
  }
}

/*
 * Performs a PATCH API request using the specified URL, headers, and payload.
 * Used to send data to an API endpoint.
 */
export const patchApiRequest =async(url: string, headers: object,payload: object = {}): Promise<any> =>{
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL certificate validation
  });

  const config: AxiosRequestConfig = {
    method: "patch",
    url: url,
    data: payload,
    headers: headers,
    httpsAgent: httpsAgent
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("Error making PATCH request:", error);
    throw error;
  }
}


export const getApiRequestWithDisabledCert = async (url: string, headers?: AxiosRequestHeaders) => {
  try {
    const response = await axios.get(url, {
      httpsAgent: insecureAgent,
      headers: headers || {
        Authorization: "2b840eecaf1e409eac008d3890a6e0db"
      }
    });
    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};