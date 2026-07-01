'use client';

export default function CountrySelect({ 
  countriesList, 
  defaultCountry 
}: { 
  countriesList: {id: string, name: string}[], 
  defaultCountry: string 
}) {
  return (
    <select 
      name="country" 
      defaultValue={defaultCountry} 
      onChange={(e) => e.target.form?.submit()}
      style={{ 
        padding: '8px 32px 8px 16px', 
        borderRadius: '8px', 
        border: '1px solid var(--line)', 
        background: '#fff', 
        fontSize: '13.5px', 
        color: 'var(--ink)', 
        appearance: 'none', 
        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%23111827%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")', 
        backgroundRepeat: 'no-repeat', 
        backgroundPosition: 'right 12px center' 
      }}
    >
      <option value="all">All countries</option>
      {countriesList.map(c => (
        <option key={c.id} value={c.name}>{c.name}</option>
      ))}
    </select>
  );
}
