const fs = require('fs');
let c = fs.readFileSync('apply_seed_rest.js', 'utf8');

// The regex looks for the defective UUIDs where the first group has a dash immediately after a few hex chars,
// e.g., 'e8-0000-0000-0000-000000000001'
c = c.replace(/([0-9a-f]{2,7})-([0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi, (match, p1, p2) => {
    // Pad the first group to 8 characters with zeros from the right (or left, doesn't matter much as long as it's consistent, 
    // but the missing part was '000001', '000002', etc. Wait, if it was 'e8' and we lost '000001', we can't recover the '1' vs '2'!
    // Ah! If we lost the 1, 2, 3, then all IDs became 'e8-0000-0000...0001'!
    // Wait, the 1, 2, 3 was at the END of the UUID? No, my original IDs were 'ex000001-0000-0000-0000-000000000001'
    // So the '1' is at the end of the first group AND at the very end.
    // Wait, let's check: 'ex000001-0000-0000-0000-000000000001' -> '000000000001' is at the very end!
    // Wait, was the first group uniquely numbered? 
    // Yes: 'ex000001', 'ex000002'...
    // If I lost the '000001', then all of them became 'e8', '57', etc.
    // Can I recover the number from the last group? Yes! The last group has '000000000001'.
    // Let's just re-generate them from scratch using the last group!
    return match; // We'll just do it in the body.
});

// Actually, let's extract the last digit from the 12-char block and use it to pad the first group!
c = c.replace(/'([0-9a-f]{2,7})-([0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-00000000000([0-9a-f]))'/gi, (match, p1, p2, p3) => {
    // p1 is 'e8', '57', etc.
    // p3 is '1', '2', etc.
    let prefix = p1;
    while (prefix.length < 7) prefix += '0';
    prefix += p3; // Now it's 8 chars long!
    return `'${prefix}-${p2}'`;
});

// Wait, what if the last group has '10'? like '...000000000010'? 
// I only went up to 7 in my seed.
// But some matches had IDs like ma000001-0000-0000-0000-000000000001. The last digit matches the first group number in ALL my seeds!
// Because I copy-pasted 'ex000001-0000...000001'.

fs.writeFileSync('apply_seed_rest.js', c);
console.log('Fixed UUIDs!');
