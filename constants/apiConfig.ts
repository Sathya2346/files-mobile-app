// constants/apiConfig.ts
export const API_HOST = "http://192.168.1.18:8000/api";


export const endpoints = {
  welcome: `${API_HOST}/welcome/`,
  mergePdf: `${API_HOST}/merge-pdf/`,
  splitPdf: `${API_HOST}/split-pdf/`,
  compressPdf: `${API_HOST}/compress-pdf/`,
  pdfToWord: `${API_HOST}/pdf-to-word/`,
  wordToPdf: `${API_HOST}/word-to-pdf/`,
  imageToPdf: `${API_HOST}/image-to-pdf/`,
  pdfToImages: `${API_HOST}/pdf-to-images/`,
  zipSelectedImages: `${API_HOST}/zip-selected-images/`,
  compressImage: `${API_HOST}/compress-image/`,
  protectPdf: `${API_HOST}/protect-pdf/`,
  unlockPdf: `${API_HOST}/unlock-pdf/`,
  pdfToPpt: `${API_HOST}/pdf-to-ppt/`,
  pptToPdf: `${API_HOST}/ppt-to-pdf/`,
  addWatermark: `${API_HOST}/add-watermark/`,
  pdfToExcel: `${API_HOST}/pdf-to-excel/`,
  excelToPdf: `${API_HOST}/excel-to-pdf/`,
  signPdf: `${API_HOST}/sign-pdf/`,
  pdfToImage: `${API_HOST}/pdf-to-image/`,
  signup: `${API_HOST}/signup/`,
  login: `${API_HOST}/login/`,

    // Profile endpoints
  getUserProfile: `${API_HOST}/profile`,
  updateProfile: `${API_HOST}/profile/update`,
  
  getFAQs: `${API_HOST}/faqs/`,
  getContactInfo: `${API_HOST}/contact-info/`,
  submitTicket: `${API_HOST}/submit-ticket/`,


};
