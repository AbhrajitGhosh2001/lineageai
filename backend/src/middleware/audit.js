const prisma = require('../lib/prisma');

/**
 * Creates an audit log entry. Non-blocking — failures are logged but don't break the request.
 */
async function audit(userId, action, resource, resourceId, patientId = null, metadata = null, req = null) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        patientId: patientId || undefined,
        metadata: metadata || undefined,
        ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || null,
        userAgent: req?.headers?.['user-agent'] || null,
      },
    });
  } catch (err) {
    console.error('[Audit] Failed to write audit log:', err.message);
  }
}

/**
 * Express middleware factory that logs every request to protected routes.
 */
function auditMiddleware(resource, action) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400 && req.user?.userId) {
        const resourceId = req.params?.id || req.params?.patientId || req.params?.memberId || 'list';
        const rawPatientId = req.params?.patientId || (resource === 'Patient' ? req.params?.id : null);
        // Only set patientId if it looks like a real cuid (not 'list' or undefined)
        const patientId = rawPatientId && rawPatientId.length > 10 ? rawPatientId : null;
        audit(
          req.user.userId,
          action,
          resource,
          resourceId,
          patientId,
          { method: req.method, path: req.path },
          req
        ).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { audit, auditMiddleware };
