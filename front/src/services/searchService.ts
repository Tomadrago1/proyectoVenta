import axios from 'axios';

export const handleLinkClick = async (
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  endpoint: string,
  route: string,
  navigate: (path: string, state?: object) => void
) => {
  event.preventDefault();

  try {
    const response = await axios.get(`http://localhost:3000/api/${endpoint}`);
    navigate(`/${route}`, { state: { [route]: response.data } });
  } catch (error) {
    console.error(`Error al obtener ${endpoint}:`, error);
  }
};