const FloatingPaws = () => {
  const pawPositions = [
    { id: 'paw-1', left: '10%', animationDelay: '0s', duration: '20s' },
    { id: 'paw-2', left: '25%', animationDelay: '4s', duration: '25s' },
    { id: 'paw-3', left: '50%', animationDelay: '2s', duration: '22s' },
    { id: 'paw-4', left: '70%', animationDelay: '6s', duration: '28s' },
    { id: 'paw-5', left: '85%', animationDelay: '8s', duration: '24s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pawPositions.map((position) => (
        <div
          key={position.id}
          className="absolute animate-float-up opacity-10"
          style={{
            left: position.left,
            bottom: '-50px',
            animationDelay: position.animationDelay,
            animationDuration: position.duration,
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path
              d="M12 18c-1.5 0-2.5-1-2.5-2.5S10.5 13 12 13s2.5 1 2.5 2.5S13.5 18 12 18z"
              fill="currentColor"
            />
            <ellipse cx="8.5" cy="12" rx="1.5" ry="2" fill="currentColor" />
            <ellipse cx="15.5" cy="12" rx="1.5" ry="2" fill="currentColor" />
            <ellipse cx="6" cy="8.5" rx="1.5" ry="2" fill="currentColor" />
            <ellipse cx="18" cy="8.5" rx="1.5" ry="2" fill="currentColor" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FloatingPaws;
