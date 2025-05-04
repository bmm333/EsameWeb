// babel.config.js
export default {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',  // Target per la versione di Node.js che stai usando
          },
        },
      ],
    ],
  };
  