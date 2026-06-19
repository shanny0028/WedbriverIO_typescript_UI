import * as fs from 'fs';
import * as path from 'path';
import { getApiRequest, postApiRequest, specialPostApiRequest, specialGetApiRequest, patchApiRequest,getApiRequestWithDisabledCert } from './apiUtils';
import { getEnvVar, setEnvVar } from './ExecutionStore';

import UIActions from '../library/UIActions';
import https from 'https';

const DATA_DIR = path.join('features', 'data');
const envName = process.env.ENV || 'TST';
/* 
* This method gets access token which can be used to fetch details from Salesforce and Mambu
* First fetching two factor ID
* Generating email OTP using email address and two factor id
* Then email OTP verification along with two factor Id
* Then storing access token to reuse.
*/
export const getAccessToken = async (username: string, emailPrefix: string): Promise<void> => {
  try {
   
  

    // Step 4: Read and prepare verifyOTP request
    const filePath = path.resolve(
      'features/config/api-configuration/' + envName.toLowerCase() + '/salesforce/verifyOTP.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const apiData = JSON.parse(fileContent);
    const otp = getEnvVar('OTP');

    apiData.data['TwoFactorId'] = getEnvVar('TWO_FACTOR_ID');
    apiData.data['Otp'] = otp;

    const secondResponse = await postApiRequest(apiData.url, apiData.headers, apiData.data);
    
//     const cookies =
//     response.headers['set-cookie'];

// const sessionId =
//     cookies?.find(cookie =>
//         cookie.startsWith('JSESSIONID'));


// console.log(sessionId);
    const accessToken = secondResponse?.AccessToken;
    // Step 6: Save access token
    setEnvVar('ACCESS_TOKEN', accessToken);
  } catch (error) {
    console.error('getAccessTokenFromResetPasswordFlow failed:', error);
  }
};


/* 
* This method gets all personal customer details from salesforce and store data in variables
*/
export const getCustomerDetailsFromSalesforce = async (): Promise<void> => {
  try {

    type Verification = {
      SubType: string;
      Status: string;
      // Add other properties if needed
    };

    const filePath = path.resolve(
      'features/config/api-configuration/' +
      envName.toLowerCase() +
      '/salesforce/' +
      'getsalesForceCustomerDetails.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const apiData = JSON.parse(fileContent); // Inject TwoFactorId from environment variable

    //key modification
    apiData.url = apiData.url.replace('{ENV}', envName.toLowerCase());
    apiData.headers['Authorization'] = 'Bearer' + ' ' + getEnvVar('ACCESS_TOKEN');

    const apiResponse = await getApiRequest(apiData.url, apiData.headers);

    // const idvStatus = apiResponse.Verifications.find(v => v.SubType === "ID&V")?.Status;
    // const bavStatus = apiResponse.Verifications.find(v => v.SubType === "BAV")?.Status;
    const bavStatus = apiResponse.Verifications.find((v: Verification) => v.SubType === "BAV")?.Status;
    const idvStatus = apiResponse.Verifications.find((v: Verification) => v.SubType === "ID&V")?.Status;

    setEnvVar('IDVStatus_CRM', idvStatus);
    setEnvVar('BAVStatus_CRM', bavStatus);
    // const sowStatus = apiResponse.Verifications.find(v => v.SubType === "SoW")?.Status;

    setEnvVar('firstName_CRM', apiResponse.FirstName);
    setEnvVar('annualIncome_CRM', apiResponse.EmploymentAndIncome?.[0]?.Income ?? undefined);
    
  } catch (error) {
    console.error('salesforce api failed ', error);
  }
};
