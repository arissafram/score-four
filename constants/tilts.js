const TILTS = {
  37: {
    name: 'left',
    max: 2400, 
    useX: true, 
    addValue: 50,
    isTiltable: ({ value, max }) => value < max,
  },
  38: {
    name: 'up',
    max: -260, 
    useX: false, 
    addValue: 50,
    isTiltable: ({ value, max }) => value < max,
  },
  39: {
    name: 'right',
    max: -2400, 
    useX: true, 
    addValue: -50,
    isTiltable: ({ value, max }) => value > max,
  },
  40: {
    name: 'down', 
    max: -2000, 
    useX: false, 
    addValue: -50,
    isTiltable: ({ value, max }) => value > max,
  },
};
