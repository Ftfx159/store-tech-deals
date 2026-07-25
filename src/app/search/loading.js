export default function Loading() {
  return (
    <div className="container" style={{ padding: '80px 20px', minHeight: '60vh' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.05)', borderRadius: '50%' }}></div>
        <div style={{ width: '300px', height: '40px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}></div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px' }}>
        <div style={{ width: '100%', height: '500px', background: 'rgba(0,0,0,0.05)', borderRadius: '16px' }}></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ width: '100%', height: '400px', background: 'rgba(0,0,0,0.05)', borderRadius: '24px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
