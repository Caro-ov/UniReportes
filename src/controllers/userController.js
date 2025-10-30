import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel.js';

/**
 * Obtener todos los usuarios (API - solo admin)
 */
export async function getAllUsers(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver la lista de usuarios'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const users = await userModel.getAllUsers(limit, offset);
        
        res.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                hasMore: users.length === limit
            }
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener un usuario específico (API)
 */
export async function getUserById(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const currentUserId = req.session.user?.id;
        const userRole = req.session.user?.rol;

        // Solo admin puede ver otros usuarios, usuarios normales solo a sí mismos
        if (userRole !== 'admin' && userId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver este usuario'
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        const user = await userModel.findUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Remover la contraseña de la respuesta
        const { contrasena, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Crear un nuevo usuario (API - solo admin)
 */
export async function createUser(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear usuarios'
            });
        }

        const { nombre, correo, codigo, contrasena, rol } = req.body;

        // Validar campos requeridos
        if (!nombre || !correo || !codigo || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }

        // Validar longitud de contraseña
        if (contrasena.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar si el email ya existe
        const emailExists = await userModel.emailExists(correo);
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con ese email'
            });
        }

        // Verificar si el código ya existe
        const codeExists = await userModel.studentCodeExists(codigo);
        if (codeExists) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con ese código'
            });
        }

        // Validar rol
        const validRoles = ['monitor', 'admin'];
        const userRole_new = rol && validRoles.includes(rol) ? rol : 'monitor';

        // Cifrar contraseña
        const contrasenaHash = await bcrypt.hash(contrasena, 10);

        const userData = {
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            codigo: codigo.trim(),
            contrasenaHash,
            rol: userRole_new
        };

        const userId = await userModel.createUser(userData);

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: { id: userId }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Actualizar un usuario (API)
 */
export async function updateUser(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const currentUserId = req.session.user?.id;
        const userRole = req.session.user?.rol;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        // Solo admin puede actualizar otros usuarios, usuarios normales solo a sí mismos
        if (userRole !== 'admin' && userId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para actualizar este usuario'
            });
        }

        // Verificar que el usuario existe
        const existingUser = await userModel.findUserById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const { nombre, correo, codigo, contrasena, rol } = req.body;
        const updateData = {};

        if (nombre) updateData.nombre = nombre.trim();
        
        if (correo) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email inválido'
                });
            }

            // Verificar si el email ya existe (excluyendo el usuario actual)
            const emailExists = await userModel.emailExists(correo, userId);
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro usuario con ese email'
                });
            }

            updateData.correo = correo.trim().toLowerCase();
        }

        if (codigo) {
            // Verificar si el código ya existe (excluyendo el usuario actual)
            const codeExists = await userModel.studentCodeExists(codigo, userId);
            if (codeExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro usuario con ese código'
                });
            }

            updateData.codigo = codigo.trim();
        }

        if (contrasena) {
            if (contrasena.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }
            updateData.contrasena = await bcrypt.hash(contrasena, 10);
        }

        // Solo admin puede cambiar roles
        if (rol && userRole === 'admin') {
            const validRoles = ['usuario', 'admin', 'monitor'];
            if (validRoles.includes(rol)) {
                updateData.rol = rol;
            }
        }

        const success = await userModel.updateUser(userId, updateData);

        if (success) {
            res.json({
                success: true,
                message: 'Usuario actualizado exitosamente'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No se pudo actualizar el usuario'
            });
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Eliminar un usuario (API - solo admin)
 */
export async function deleteUser(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar usuarios'
            });
        }

        const userId = parseInt(req.params.id);
        const currentUserId = req.session.user?.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        // No permitir que el admin se elimine a sí mismo
        if (userId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminar tu propia cuenta'
            });
        }

        // Verificar que el usuario existe
        const existingUser = await userModel.findUserById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const success = await userModel.deleteUser(userId);

        if (success) {
            res.json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No se pudo eliminar el usuario'
            });
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Buscar usuarios con filtros (API - solo admin)
 */
export async function searchUsers(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden buscar usuarios'
            });
        }

        const filters = {
            rol: req.query.rol,
            buscar: req.query.q,
            limit: parseInt(req.query.limit) || 50
        };

        const users = await userModel.getUsersFiltered(filters);

        res.json({
            success: true,
            data: users,
            filters: filters
        });
    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener estadísticas de usuarios (API - solo admin)
 */
export async function getUsersStats(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver estadísticas'
            });
        }

        const stats = await userModel.getUsersStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener perfil del usuario actual (API)
 */
export async function getCurrentUserProfile(req, res) {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const user = await userModel.findUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Remover la contraseña de la respuesta
        const { contrasena, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

// Cambiar contraseña del usuario actual
export const changePassword = async (req, res) => {
    try {
        // Obtener userId de la sesión
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Las contraseñas nuevas no coinciden'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe ser diferente a la actual'
            });
        }

        // Obtener el usuario actual
        const user = await userModel.findUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar la contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.contrasena);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
            });
        }

        // Cifrar la nueva contraseña
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar la contraseña en la base de datos
        const updateResult = await userModel.updateUser(userId, { contrasena: hashedNewPassword });

        if (updateResult) {
            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la contraseña'
            });
        }

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

export default {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getUsersStats,
    getCurrentUserProfile,
    changePassword
};
