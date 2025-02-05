export async function saveSavingsData(data: {
  day: number;
  date: string;
  amount: number;
  saved: boolean;
}) {
  const response = await fetch('/api/sheets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save data');
  }
  return response.json();
}

export async function getSavedDays() {
  const response = await fetch('/api/sheets');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();
  return data.savedDays;
}

export async function deleteSavingsData(day: number) {
  const response = await fetch('/api/sheets', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ day }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete data');
  }
  return response.json();
}
