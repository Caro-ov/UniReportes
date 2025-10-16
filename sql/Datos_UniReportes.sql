-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-10-2025 a las 15:30:00
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12
-- Modificado para UniReportes con roles admin/monitor y códigos de 10 dígitos

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Crear base de datos: `Datos_Unireportes`
--
CREATE DATABASE IF NOT EXISTS `Datos_Unireportes` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `Datos_Unireportes`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos`
--

CREATE TABLE `archivos` (
  `id_archivo` int(11) NOT NULL,
  `id_reporte` int(11) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `fecha_subida` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `id_dependencia` int(11) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `id_dependencia`, `nombre`, `descripcion`) VALUES
(1, NULL, 'Infraestructura', 'Problemas con edificios, aulas, baños'),
(2, NULL, 'Tecnología', 'Problemas con equipos, internet, proyectores'),
(3, NULL, 'Seguridad', 'Problemas de seguridad, iluminación'),
(4, NULL, 'Limpieza', 'Problemas de aseo y mantenimiento'),
(5, NULL, 'Otros', 'Otros problemas no clasificados');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios`
--

CREATE TABLE `comentarios` (
  `id_comentario` int(11) NOT NULL,
  `id_reporte` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `comentario` text DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dependencias`
--

CREATE TABLE `dependencias` (
  `id_dependencia` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `correo_contacto` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dependencias`
--

INSERT INTO `dependencias` (`id_dependencia`, `nombre`, `descripcion`, `telefono`, `correo_contacto`) VALUES
(1, 'Servicios Generales', 'Mantenimiento general y limpieza', '+57 1 234-5678', 'servicios@uni.local'),
(2, 'Tecnología e Informática', 'Soporte técnico y equipos', '+57 1 234-5679', 'soporte@uni.local'),
(3, 'Seguridad Física', 'Vigilancia y seguridad del campus', '+57 1 234-5680', 'seguridad@uni.local');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `objetos`
--

CREATE TABLE `objetos` (
  `id_objeto` int(11) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `especificaciones` text DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id_reporte` int(11) NOT NULL,
  `id_objeto` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `fecha_reporte` datetime DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'pendiente',
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `correo` varchar(200) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `rol` varchar(50) DEFAULT 'monitor',
  `codigo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `contrasena`, `fecha_creacion`, `rol`, `codigo`) VALUES
(1, 'Administrador Principal', 'admin@uni.local', '$2a$10$ytT0UjMYxGdcICXmkUSGseWJAQ0p7mBTE5hKpIkmdEjpUNAHHYodq', '2025-10-10 18:53:12', 'admin', '2024000001'),
(2, 'Rubén González', 'ruben@gmail.com', '$2y$10$IUUEy4I5pZsYvk8JegVdYOENgG97F6CTvEYcauubU2wjcJIxB4tEO', '2025-10-10 20:05:22', 'admin', '2019214026'),
(3, 'Adriana María', 'adriana@gmail.com', '$2y$10$uVkO0mo5iPUQESUk6FSOYuvwYjYjELdSCVBojbAtFa3yRVQuuXgYK', '2025-10-11 11:25:45', 'monitor', '2014214026'),
(4, 'Jorge Silva', 'jorge@gmail.com', '$2y$10$xrLV1mVlJKj.OEAKcE7Lsuvon3OQ1tKi3aZxfq3zvUXbz89I7Ewda', '2025-10-11 11:52:49', 'monitor', '2018156789');

--
-- Disparadores `usuarios`
--
DELIMITER $$
CREATE TRIGGER `usuarios_before_insert` BEFORE INSERT ON `usuarios` FOR EACH ROW BEGIN
  IF NEW.codigo IS NOT NULL THEN
    SET NEW.codigo = TRIM(NEW.codigo);
    IF NEW.codigo = '' THEN
      SET NEW.codigo = NULL;
    ELSEIF NEW.codigo NOT REGEXP '^[0-9]{10}$' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El código debe tener exactamente 10 dígitos (ej: 2014214026).';
    END IF;
  END IF;
END
$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `usuarios_before_update` BEFORE UPDATE ON `usuarios` FOR EACH ROW BEGIN
  IF NEW.codigo IS NOT NULL THEN
    SET NEW.codigo = TRIM(NEW.codigo);
    IF NEW.codigo = '' THEN
      SET NEW.codigo = NULL;
    ELSEIF NEW.codigo NOT REGEXP '^[0-9]{10}$' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El código debe tener exactamente 10 dígitos (ej: 2014214026).';
    END IF;
  END IF;
END
$$
DELIMITER ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `archivos`
--
ALTER TABLE `archivos`
  ADD PRIMARY KEY (`id_archivo`),
  ADD KEY `id_reporte` (`id_reporte`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD KEY `id_dependencia` (`id_dependencia`);

--
-- Indices de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD PRIMARY KEY (`id_comentario`),
  ADD KEY `id_reporte` (`id_reporte`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `dependencias`
--
ALTER TABLE `dependencias`
  ADD PRIMARY KEY (`id_dependencia`);

--
-- Indices de la tabla `objetos`
--
ALTER TABLE `objetos`
  ADD PRIMARY KEY (`id_objeto`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id_reporte`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_objeto` (`id_objeto`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `archivos`
--
ALTER TABLE `archivos`
  MODIFY `id_archivo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  MODIFY `id_comentario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `dependencias`
--
ALTER TABLE `dependencias`
  MODIFY `id_dependencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `objetos`
--
ALTER TABLE `objetos`
  MODIFY `id_objeto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `archivos`
--
ALTER TABLE `archivos`
  ADD CONSTRAINT `archivos_ibfk_1` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id_reporte`) ON DELETE CASCADE;

--
-- Filtros para la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`id_dependencia`) REFERENCES `dependencias` (`id_dependencia`) ON DELETE SET NULL;

--
-- Filtros para la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id_reporte`) ON DELETE CASCADE,
  ADD CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `objetos`
--
ALTER TABLE `objetos`
  ADD CONSTRAINT `objetos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL;

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  ADD CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL,
  ADD CONSTRAINT `reportes_ibfk_3` FOREIGN KEY (`id_objeto`) REFERENCES `objetos` (`id_objeto`) ON DELETE SET NULL;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;