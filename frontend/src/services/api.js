import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({ baseURL: BASE_URL })

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

// Maps the React form state (booleans, has_contacted) to the shape CustomerInput expects.
function toBackendCustomer(formData) {
  const byn = (val) => (val ? 'yes' : 'no')
  return {
    age: formData.age,
    job: formData.job,
    marital: formData.marital,
    education: formData.education,
    default: byn(formData.default),
    balance: formData.balance,
    housing: byn(formData.housing),
    loan: byn(formData.loan),
    contact: formData.contact,
    day: formData.day,
    month: MONTHS[new Date().getMonth()],
    duration: 0,
    campaign: 1,
    // backend uses 999 for "never contacted"; form uses -1
    pdays: formData.has_contacted && formData.pdays !== -1 ? formData.pdays : 999,
    previous: formData.has_contacted ? 1 : 0,
    poutcome: formData.poutcome,
  }
}

export async function predictCustomer(customerData) {
  const response = await api.post('/predict/', toBackendCustomer(customerData))
  return response.data
}

export function explainPrediction(customer, prediction) {
  return fetch(`${BASE_URL}/explain/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer: toBackendCustomer(customer), prediction }),
  })
}

export function chatWithAdvisor(customer, prediction, messages) {
  return fetch(`${BASE_URL}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer: toBackendCustomer(customer), prediction, messages }),
  })
}
