const PLAYER_NAMES = {
  '1902': 'Amy Kesting',
  '38284': 'Andrea Johnston',
  '41535': 'Ashley Fecteau',
  '36418': 'Carey Huffman',
  '33826': 'Jazz Draper',
  '39480': 'Kasey Jarvis',
  '26073': 'Lindsey Sickler',
  '15930': 'Molly Oury',
  '27746': 'Olivia Haberkorn',
  '22919': 'Rachel Engels',
  '14049': 'Rose Quinn',
  '26618': 'Sarah Crismore',
  '30684': 'Skylar DeWitt',
  '23371': 'Sydnee Deventer',
  '38364': 'Tammy Miller IN',
  '6123': 'Trisha Burgess'
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Convert to array and sort alphabetically by name
  const players = Object.entries(PLAYER_NAMES)
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.status(200).json({ players });
}
