// Import all remaining elements CSS
const requireAll = (context) => context.keys().map(context);
requireAll(require.context('./styles', true, /^.*\.css$/));