const supabaseDB = require('../supabaseDB');

async function handleAutoRole(member) {
    try {
        const roleIds = await supabaseDB.getAutoRoles(member.guild.id);
        if (!roleIds || roleIds.length === 0) return;

        const rolesToAssign = [];
        for (const roleId of roleIds) {
            const role = member.guild.roles.cache.get(roleId);
            if (role && role.editable) {
                rolesToAssign.push(role);
            }
        }

        if (rolesToAssign.length > 0) {
            await member.roles.add(rolesToAssign).catch(e => {
                console.error(`Failed to assign auto-roles in ${member.guild.name}:`, e.message);
            });
        }
    } catch (error) {
        console.error('Auto-role error:', error);
    }
}

module.exports = { handleAutoRole };
