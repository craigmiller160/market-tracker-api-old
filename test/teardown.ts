export {};

module.exports = async (...args: any[]) => {
    console.log('GlobalExit', args);
    process.exit(0);
}