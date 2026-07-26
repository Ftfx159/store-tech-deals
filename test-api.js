const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'real-time-amazon-data.p.rapidapi.com';

async function test() {
  const url = new URL(`https://${RAPIDAPI_HOST}/search`);
  url.searchParams.append('query', 'lightning deals electronics');
  url.searchParams.append('page', '1');
  url.searchParams.append('country', 'IN');
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': '78a9c8b7c6d5e4f3a2b1c0d9e8f7a6b5' // I will just run it through Next.js env or skip this and run it via next.
    }
  });
  console.log(response.status);
}
test();
