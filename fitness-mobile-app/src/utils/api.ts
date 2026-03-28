import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY;
const API_HOST = process.env.EXPO_PUBLIC_EXERCISEDB_API_HOST;

const exerciseApi = axios.create({
  baseURL: 'https://exercisedb.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST,
  },
});

export const api = {
  exercises: {
    getBodyParts: () => exerciseApi.get('/exercises/bodyPartList'),
    getTargets: () => exerciseApi.get('/exercises/targetList'),
    getEquipment: () => exerciseApi.get('/exercises/equipmentList'),
    getByBodyPart: (bodyPart: string, limit = 10, offset = 0) =>
      exerciseApi.get(`/exercises/bodyPart/${bodyPart}?limit=${limit}&offset=${offset}`),
    getByTarget: (target: string, limit = 10, offset = 0) =>
      exerciseApi.get(`/exercises/target/${target}?limit=${limit}&offset=${offset}`),
    getByEquipment: (equipment: string, limit = 10, offset = 0) =>
      exerciseApi.get(`/exercises/equipment/${equipment}?limit=${limit}&offset=${offset}`),
    getDetail: (id: string) => exerciseApi.get(`/exercises/exercise/${id}`),
  },
};
