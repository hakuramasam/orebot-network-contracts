/**
 * Compile CreditManager.sol and SkillRegistry.sol using solc npm package.
 * Outputs ABI + bytecode for both contracts.
 */
const solc = require('solc');
const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '..', 'src');

function findImport(importPath) {
  // Handle own imports
  const fullPath = path.join(contractsDir, importPath);
  if (fs.existsSync(fullPath)) {
    return { contents: fs.readFileSync(fullPath, 'utf8') };
  }
  // Handle lib imports (openzeppelin, forge-std, etc.)
  const libPath = path.join(__dirname, '..', 'lib', importPath);
  if (fs.existsSync(libPath)) {
    return { contents: fs.readFileSync(libPath, 'utf8') };
  }
  return { error: 'File not found: ' + importPath };
}

// Compile both contracts
const sources = {
  'CreditManager.sol': {
    content: fs.readFileSync(path.join(contractsDir, 'CreditManager.sol'), 'utf8')
  },
  'SkillRegistry.sol': {
    content: fs.readFileSync(path.join(contractsDir, 'SkillRegistry.sol'), 'utf8')
  }
};

const input = {
  language: 'Solidity',
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    viaIR: true,
    outputSelection: {
      '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object'] }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));

if (output.errors) {
  const errors = output.errors.filter(e => e.severity === 'error');
  if (errors.length > 0) {
    console.error('Compilation errors:');
    errors.forEach(e => console.error(e.formattedMessage));
    process.exit(1);
  }
}

// Extract and save results
const results = {};
for (const [fileName, contracts] of Object.entries(output.contracts)) {
  for (const [contractName, data] of Object.entries(contracts)) {
    results[contractName] = {
      abi: data.abi,
      bytecode: '0x' + data.evm.bytecode.object
    };
    console.log(`${contractName}: ABI entries=${data.abi.length}, bytecode=${data.evm.bytecode.object.length} chars`);
  }
}

// Write to file
fs.writeFileSync(
  path.join(__dirname, 'compiled-contracts.json'),
  JSON.stringify(results, null, 2)
);
console.log('\nSaved to scripts/compiled-contracts.json');
