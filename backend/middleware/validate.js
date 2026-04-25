const { z } = require('zod');

/**
 * Returns an Express middleware that validates req.body (default),
 * req.query, or req.params against a Zod schema.
 *
 * On failure → 400 with { success: false, error: "<message>", field: "<path>" }
 * On success → req[source] is replaced with the parsed/coerced data
 */
function validate(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const issues = result.error.issues ?? result.error.errors ?? [];
            const first  = issues[0];
            return res.status(400).json({
                success: false,
                error:   first?.message   ?? 'Validation failed',
                field:   first?.path?.join('.') || undefined
            });
        }
        req[source] = result.data; // use coerced/stripped data
        next();
    };
}

module.exports = validate;
