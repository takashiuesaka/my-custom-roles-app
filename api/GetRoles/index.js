const fetch = require('node-fetch').default;

// add role names to this object to map them to group ids in your AAD tenant
const roleGroupMappings = {
    'admin': '57bc47ec-0557-416c-a862-220fd6665cf5',
    'reader': '8dc43e83-4c21-4cbe-b46a-93201024f839'
};

module.exports = async function (context, req) {
    const user = req.body || {};
    const roles = [];
    
//    for (const [role, groupId] of Object.entries(roleGroupMappings)) {
//        if (await isUserInGroup(groupId, user.accessToken)) {
//            context.log('role mached! role: ' + role);
//            roles.push(role);
//        }
//    }

    const claims = user.claims;

    if (claims) {
        claims.forEach(claim => {
            for (const [role, groupId] of Object.entries(roleGroupMappings)) {
                if (claim.typ === 'groups' && claim.val === groupId) {
                    roles.push(role);
                }
            }
        }
    }

//    roles.push('admin')
    
    context.res.json({
        roles
    });
}

async function isUserInGroup(groupId, bearerToken) {
    const url = new URL('https://graph.microsoft.com/v1.0/me/memberOf');
    url.searchParams.append('$filter', `id eq '${groupId}'`);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        },
    });

    if (response.status !== 200) {
        return false;
    }

    const graphResponse = await response.json();
    const matchingGroups = graphResponse.value.filter(group => group.id === groupId);
    return matchingGroups.length > 0;
}
