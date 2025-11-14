-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-11-2025 a las 16:28:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `datos_unireportes`
--

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

--
-- Volcado de datos para la tabla `archivos`
--

INSERT INTO `archivos` (`id_archivo`, `id_reporte`, `url`, `tipo`, `fecha_subida`) VALUES
(1, 10, 'uploads/reports/2025/11/06/1762439474156-640-tigre.jpg', 'image/jpeg', '2025-11-06 09:31:14'),
(2, 11, 'uploads/reports/2025/11/06/1762465987375-629-UniReportes_-_Mis_Reportes_-_Brave_2025-10-27_12-5.mp4', 'video/mp4', '2025-11-06 16:53:07'),
(3, 11, 'uploads/reports/2025/11/06/1762465987472-19-Captura_de_pantalla_2025-11-06_104233.png', 'image/png', '2025-11-06 16:53:07'),
(4, 12, 'uploads/reports/2025/11/07/1762531072884-229-beastars9.jpg', 'image/jpeg', '2025-11-07 10:57:52'),
(5, 12, 'uploads/reports/2025/11/07/1762531072898-421-beastars10.jpg', 'image/jpeg', '2025-11-07 10:57:52'),
(6, 12, 'uploads/reports/2025/11/07/1762531072914-793-beastars11.jpg', 'image/jpeg', '2025-11-07 10:57:52'),
(7, 12, 'uploads/reports/2025/11/07/1762531072936-307-beastars12.jpg', 'image/jpeg', '2025-11-07 10:57:52'),
(8, 12, 'uploads/reports/2025/11/07/1762531072948-297-beastars13.jpg', 'image/jpeg', '2025-11-07 10:57:52'),
(9, 10, 'uploads/reports/2025/11/08/1762644082942-135-anubis.png', 'image/png', '2025-11-08 18:21:22'),
(17, 7, 'uploads/reports/2025/11/09/1762702696292-984-ANE1.jpg', 'image/jpeg', '2025-11-09 10:38:16'),
(21, 13, 'uploads/reports/2025/11/09/1762705022500-795-anubis.png', 'image/png', '2025-11-09 11:17:02');

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
(5, NULL, 'Otros', 'Otros problemas no clasificados'),
(6, NULL, 'Urgencia', 'Reportes que requieren atención inmediata');

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

--
-- Volcado de datos para la tabla `comentarios`
--

INSERT INTO `comentarios` (`id_comentario`, `id_reporte`, `id_usuario`, `comentario`, `fecha`) VALUES
(1, 11, 1, 'prueba 1 de comentario', '2025-11-06 17:15:07'),
(2, 11, 3, 'comentarios funcionando correctamente', '2025-11-06 17:16:39'),
(3, 11, 3, 'todo funciona?', '2025-11-06 17:18:05'),
(4, 11, 3, 'ya funciona el header?', '2025-11-06 17:21:35'),
(5, 9, 3, '.............................', '2025-11-06 18:47:16'),
(6, 13, 7, 'historial de cambios totalmente funcional sin errores!', '2025-11-09 11:50:54'),
(7, 11, 3, 'hola papuuuu', '2025-11-10 14:12:22'),
(8, 13, 1, 'prueba de comentario', '2025-11-12 09:25:17');

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
-- Estructura de tabla para la tabla `estados`
--

CREATE TABLE `estados` (
  `id_estado` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `orden` tinyint(3) UNSIGNED DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados`
--

INSERT INTO `estados` (`id_estado`, `nombre`, `orden`, `fecha_creacion`) VALUES
(1, 'Pendiente', 1, '2025-11-04 19:19:35'),
(2, 'Revisado', 2, '2025-11-04 19:19:35'),
(3, 'En proceso', 3, '2025-11-04 19:19:35'),
(4, 'Resuelto', 4, '2025-11-04 19:19:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_cambios`
--

CREATE TABLE `historial_cambios` (
  `id_historial` int(11) NOT NULL,
  `id_reporte` int(11) NOT NULL,
  `tipo` varchar(30) NOT NULL,
  `id_estado_anterior` int(11) DEFAULT NULL,
  `id_estado_nuevo` int(11) DEFAULT NULL,
  `id_usuario_actor` int(11) DEFAULT NULL,
  `id_usuario_asignado` int(11) DEFAULT NULL,
  `id_dependencia_asignada` int(11) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `campo` varchar(50) DEFAULT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `cambios_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cambios_json`)),
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_cambios`
--

INSERT INTO `historial_cambios` (`id_historial`, `id_reporte`, `tipo`, `id_estado_anterior`, `id_estado_nuevo`, `id_usuario_actor`, `id_usuario_asignado`, `id_dependencia_asignada`, `descripcion`, `campo`, `valor_anterior`, `valor_nuevo`, `cambios_json`, `fecha`) VALUES
(3, 12, 'cambio_estado', 1, 2, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"revisado\"', NULL, NULL, NULL, NULL, '2025-11-07 11:44:51'),
(4, 12, 'cambio_estado', 2, 3, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"en proceso\"', NULL, NULL, NULL, NULL, '2025-11-08 17:20:39'),
(5, 11, 'cambio_estado', 1, 4, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"resuelto\"', NULL, NULL, NULL, NULL, '2025-11-08 17:26:10'),
(6, 11, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: titulo, descripcion, id_salon, fecha_reporte', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba de vista archivos y comentario\",\"valor_nuevo\":\"Prueba de vista archivos y comentario(edición)\"},{\"campo\":\"descripcion\",\"valor_anterior\":\"ver si los comentarios funcionan y se pueden ver fotos y videos..\",\"valor_nuevo\":\"ver si los comentarios funcionan y se pueden ver fotos y videos..\\n\\nviendo si funciona la edición\"},{\"campo\":\"id_salon\",\"valor_anterior\":\"66\",\"valor_nuevo\":\"28\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-06T21:51:00.000Z\",\"valor_nuevo\":\"2025-11-06\"}]', '2025-11-08 18:02:26'),
(7, 10, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: fecha_reporte', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-03T14:28:00.000Z\",\"valor_nuevo\":\"2025-11-03\"}]', '2025-11-08 18:28:57'),
(8, 10, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: fecha_reporte', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-03T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-03\"}]', '2025-11-08 18:30:37'),
(9, 11, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: titulo, fecha_reporte', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba de vista archivos y comentario(edición)\",\"valor_nuevo\":\"Prueba de vista archivos y comentario(edición).\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-06T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-06\"}]', '2025-11-09 08:53:22'),
(10, 11, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: Título, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba de vista archivos y comentario(edición).\",\"valor_nuevo\":\"Prueba de vista archivos y comentario(edición)\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-06T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-06\"}]', '2025-11-09 09:30:31'),
(11, 9, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: Título, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Luces dañadas\",\"valor_nuevo\":\"Luces dañadas.\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-10-25T23:21:00.000Z\",\"valor_nuevo\":\"2025-10-25\"}]', '2025-11-09 09:33:26'),
(12, 6, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: Título, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Luces dañadas\",\"valor_nuevo\":\"Luces dañadas.\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-05T00:52:48.000Z\",\"valor_nuevo\":\"2025-11-05\"}]', '2025-11-09 09:37:00'),
(13, 10, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-03T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-03\"}]', '2025-11-09 09:42:24'),
(14, 10, 'archivo_eliminado', NULL, NULL, 3, NULL, NULL, 'Archivo eliminado: undefined', NULL, NULL, NULL, NULL, '2025-11-09 09:42:24'),
(15, 10, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: Título, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba manejo de archivos\",\"valor_nuevo\":\"Prueba manejo de archivos.\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-03T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-03\"}]', '2025-11-09 09:42:39'),
(16, 11, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: Título, Descripción, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba de vista archivos y comentario(edición)\",\"valor_nuevo\":\"Prueba de vista archivos y comentario(edición).\"},{\"campo\":\"descripcion\",\"valor_anterior\":\"ver si los comentarios funcionan y se pueden ver fotos y videos..\\n\\nviendo si funciona la edición\",\"valor_nuevo\":\"ver si los comentarios funcionan y se pueden ver fotos y videos..\\n\\nviendo si funciona la edición...\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-06T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-06\"}]', '2025-11-09 09:46:17'),
(17, 12, 'edicion', NULL, NULL, 6, NULL, NULL, 'Reporte editado: Título, Salón, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"prueba de funcion reporte\",\"valor_nuevo\":\"prueba de función reporte\"},{\"campo\":\"id_salon\",\"valor_anterior\":\"48\",\"valor_nuevo\":\"47\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-10-09T15:55:00.000Z\",\"valor_nuevo\":\"2025-10-09\"}]', '2025-11-09 09:50:53'),
(18, 12, 'edicion', NULL, NULL, 6, NULL, NULL, 'Reporte editado: Título, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"prueba de función reporte\",\"valor_nuevo\":\"prueba de función reporte.\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-10-09T05:00:00.000Z\",\"valor_nuevo\":\"2025-10-09\"}]', '2025-11-09 09:56:16'),
(19, 12, 'edicion', NULL, NULL, 6, NULL, NULL, 'Reporte editado: Título, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"prueba de función reporte.\",\"valor_nuevo\":\"Prueba de función reporte\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-10-09T05:00:00.000Z\",\"valor_nuevo\":\"2025-10-09\"}]', '2025-11-09 09:57:42'),
(20, 12, 'edicion', NULL, NULL, 6, NULL, NULL, 'Reporte editado: Título, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba de función reporte\",\"valor_nuevo\":\"Prueba de función reporte.\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-10-09T05:00:00.000Z\",\"valor_nuevo\":\"2025-10-09\"}]', '2025-11-09 10:01:23'),
(21, 12, 'edicion', NULL, NULL, 6, NULL, NULL, 'Reporte editado: Título, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba de función reporte.\",\"valor_nuevo\":\"Prueba de función reporte\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-10-09T05:00:00.000Z\",\"valor_nuevo\":\"2025-10-09\"}]', '2025-11-09 10:04:09'),
(22, 6, 'edicion', NULL, NULL, 3, NULL, NULL, 'Reporte editado: Título, Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Luces dañadas.\",\"valor_nuevo\":\"Luces dañadas\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-05T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-05\"}]', '2025-11-09 10:08:46'),
(23, 7, 'archivo', NULL, NULL, 6, NULL, NULL, '1 archivo(s) agregado(s): ANE1.jpg', NULL, NULL, NULL, NULL, '2025-11-09 10:34:04'),
(24, 7, 'edicion', NULL, NULL, 6, NULL, NULL, 'Reporte editado: Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-01T14:04:00.000Z\",\"valor_nuevo\":\"2025-11-01\"}]', '2025-11-09 10:34:04'),
(25, 7, 'edicion', NULL, NULL, 6, NULL, NULL, 'Reporte editado: Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-01T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-01\"}]', '2025-11-09 10:37:13'),
(26, 7, 'archivo', NULL, NULL, 6, NULL, NULL, '1 archivo(s) agregado(s): ANE1.jpg', NULL, NULL, NULL, NULL, '2025-11-09 10:38:16'),
(27, 7, 'edicion', NULL, NULL, 6, NULL, NULL, 'Reporte editado: Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-01T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-01\"}]', '2025-11-09 10:38:16'),
(28, 13, 'archivo', NULL, NULL, 7, NULL, NULL, '1 archivo(s) agregado(s): ANE1.jpg', NULL, NULL, NULL, NULL, '2025-11-09 10:46:10'),
(29, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-08T15:44:00.000Z\",\"valor_nuevo\":\"2025-11-08\"}]', '2025-11-09 10:46:10'),
(30, 13, 'archivo', NULL, NULL, 7, NULL, NULL, '1 archivo(s) agregado(s): anubis.png', NULL, NULL, NULL, NULL, '2025-11-09 10:57:24'),
(31, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-08T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-08\"}]', '2025-11-09 10:57:24'),
(32, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-08T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-08\"}]', '2025-11-09 11:05:36'),
(33, 13, 'archivo', NULL, NULL, 7, NULL, NULL, '4 archivo(s) agregado(s): balto1.png, anubis.png, anubis1.jpg, balto.jpg', NULL, NULL, NULL, NULL, '2025-11-09 11:17:02'),
(34, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-08T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-08\"}]', '2025-11-09 11:17:02'),
(35, 13, 'archivo', NULL, NULL, 7, NULL, NULL, '1 archivo(s) eliminado(s): 1762705022429-961-balto1.png', NULL, NULL, NULL, NULL, '2025-11-09 11:17:26'),
(36, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Fecha reportada', NULL, NULL, NULL, '[{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-08T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-08\"}]', '2025-11-09 11:17:26'),
(37, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Descripción', NULL, NULL, NULL, '[{\"campo\":\"descripcion\",\"valor_anterior\":\"Prueba de pantalla detalles, los archivos y historial de cambios\",\"valor_nuevo\":\"Prueba de pantalla detalles, los archivos y historial de cambios(listo)\"}]', '2025-11-09 11:21:08'),
(38, 13, 'archivo', NULL, NULL, 7, NULL, NULL, '1 archivo(s) eliminado(s): 1762705022557-440-balto.jpg', NULL, NULL, NULL, NULL, '2025-11-09 11:22:14'),
(39, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Descripción, Categoría', NULL, NULL, NULL, '[{\"campo\":\"descripcion\",\"valor_anterior\":\"Prueba de pantalla detalles, los archivos y historial de cambios(listo)\",\"valor_nuevo\":\"Prueba de pantalla detalles, los archivos y historial de cambios(listo)\\r\\nverificacion que ya no sale siempre que se mofico la fecha\"},{\"campo\":\"id_categoria\",\"valor_anterior\":\"1\",\"valor_nuevo\":\"4\"}]', '2025-11-09 11:22:14'),
(40, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Descripción, Fecha y hora del incidente', NULL, NULL, NULL, '[{\"campo\":\"descripcion\",\"valor_anterior\":\"Prueba de pantalla detalles, los archivos y historial de cambios(listo)\\r\\nverificacion que ya no sale siempre que se mofico la fecha\",\"valor_nuevo\":\"Prueba de pantalla detalles, los archivos y historial de cambios(listo)\\nverificacion que ya no sale siempre que se mofico la fecha\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-08T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-07T19:00\"}]', '2025-11-09 11:37:11'),
(41, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Título, Fecha y hora del incidente', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba de pantalla detalles\",\"valor_nuevo\":\"Prueba de pantalla detalles.\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-08T00:00:00.000Z\",\"valor_nuevo\":\"2025-11-08T00:00\"}]', '2025-11-09 11:37:36'),
(42, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Título, Fecha y hora del incidente', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba de pantalla detalles.\",\"valor_nuevo\":\"Prueba de pantalla detalles\"},{\"campo\":\"fecha_reporte\",\"valor_anterior\":\"2025-11-08T05:00:00.000Z\",\"valor_nuevo\":\"2025-11-08T05:00\"}]', '2025-11-09 11:40:52'),
(43, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Categoría', NULL, NULL, NULL, '[{\"campo\":\"id_categoria\",\"valor_anterior\":\"4\",\"valor_nuevo\":\"1\"}]', '2025-11-09 11:45:29'),
(44, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Descripción', NULL, NULL, NULL, '[{\"campo\":\"descripcion\",\"valor_anterior\":\"Prueba de pantalla detalles, los archivos y historial de cambios(listo)\\nverificacion que ya no sale siempre que se mofico la fecha\",\"valor_nuevo\":\"Prueba de pantalla detalles, los archivos y historial de cambios(listo)\\nverificación que ya no sale siempre que se mórfico la fecha\"}]', '2025-11-09 11:45:49'),
(45, 13, 'archivo', NULL, NULL, 7, NULL, NULL, '1 archivo(s) eliminado(s): 1762705022529-821-anubis1.jpg', NULL, NULL, NULL, NULL, '2025-11-09 11:46:18'),
(46, 13, 'edicion', NULL, NULL, 7, NULL, NULL, 'Reporte editado: Título, Descripción, Categoría', NULL, NULL, NULL, '[{\"campo\":\"titulo\",\"valor_anterior\":\"Prueba de pantalla detalles\",\"valor_nuevo\":\"Prueba de pantalla detalles.\"},{\"campo\":\"descripcion\",\"valor_anterior\":\"Prueba de pantalla detalles, los archivos y historial de cambios(listo)\\nverificación que ya no sale siempre que se mórfico la fecha\",\"valor_nuevo\":\"Prueba de pantalla detalles, los archivos y historial de cambios(listo).\\r\\nverificación que ya no sale siempre que se mórfico la fecha\"},{\"campo\":\"id_categoria\",\"valor_anterior\":\"1\",\"valor_nuevo\":\"2\"}]', '2025-11-09 11:46:18'),
(47, 3, 'cambio_estado', 1, 2, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"revisado\"', NULL, NULL, NULL, NULL, '2025-11-10 14:03:52'),
(48, 6, 'cambio_estado', 1, 4, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"resuelto\"', NULL, NULL, NULL, NULL, '2025-11-10 14:04:55'),
(49, 6, 'cambio_estado', 4, 1, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"pendiente\"', NULL, NULL, NULL, NULL, '2025-11-10 14:05:07'),
(50, 6, 'cambio_estado', 1, 2, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"revisado\"', NULL, NULL, NULL, NULL, '2025-11-10 14:05:12'),
(51, 6, 'cambio_estado', 2, 1, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"pendiente\"', NULL, NULL, NULL, NULL, '2025-11-10 14:05:31'),
(52, 6, 'cambio_estado', 1, 2, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"revisado\"', NULL, NULL, NULL, NULL, '2025-11-10 14:05:36'),
(53, 6, 'cambio_estado', 2, 3, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"en proceso\"', NULL, NULL, NULL, NULL, '2025-11-10 14:05:40'),
(54, 6, 'cambio_estado', 3, 4, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"resuelto\"', NULL, NULL, NULL, NULL, '2025-11-10 14:05:43'),
(55, 6, 'cambio_estado', 4, 1, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"pendiente\"', NULL, NULL, NULL, NULL, '2025-11-10 14:05:46'),
(56, 14, 'cambio_estado', 1, 2, NULL, NULL, NULL, 'Estado cambiado de estado anterior a \"revisado\"', NULL, NULL, NULL, NULL, '2025-11-12 10:12:41');

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

--
-- Volcado de datos para la tabla `objetos`
--

INSERT INTO `objetos` (`id_objeto`, `id_categoria`, `nombre`, `especificaciones`, `fecha_registro`) VALUES
(1, 1, 'Puerta', 'Puertas de aulas, oficinas o edificios', '2025-11-02 11:09:52'),
(2, 1, 'Ventana', 'Ventanas y cristales', '2025-11-02 11:09:52'),
(3, 1, 'Techo', 'Techos y cielo rasos', '2025-11-02 11:09:52'),
(4, 1, 'Piso', 'Pisos, baldosas y superficies', '2025-11-02 11:09:52'),
(5, 1, 'Pared', 'Paredes y muros', '2025-11-02 11:09:52'),
(6, 1, 'Escalera', 'Escaleras y pasamanos', '2025-11-02 11:09:52'),
(7, 1, 'Ascensor', 'Elevadores y montacargas', '2025-11-02 11:09:52'),
(8, 1, 'Baño', 'Sanitarios, lavamanos e instalaciones sanitarias', '2025-11-02 11:09:52'),
(9, 1, 'Iluminación', 'Lámparas, bombillos y sistemas de luz', '2025-11-02 11:09:52'),
(10, 1, 'Pintura', 'Pintura de paredes y superficies', '2025-11-02 11:09:52'),
(11, 1, 'Silla', 'Sillas de aulas y oficinas', '2025-11-02 11:09:52'),
(12, 1, 'Mesa', 'Mesas y escritorios', '2025-11-02 11:09:52'),
(13, 1, 'Pupitre', 'Pupitres de estudiantes', '2025-11-02 11:09:52'),
(14, 1, 'Pizarra', 'Pizarras acrílicas o tradicionales', '2025-11-02 11:09:52'),
(15, 1, 'Estante', 'Estanterías y libreros', '2025-11-02 11:09:52'),
(16, 1, 'Archivador', 'Archivadores y gabinetes', '2025-11-02 11:09:52'),
(17, 1, 'Locker', 'Casilleros de estudiantes', '2025-11-02 11:09:52'),
(18, 1, 'Banca', 'Bancas y asientos públicos', '2025-11-02 11:09:52'),
(19, 1, 'Tubería', 'Tuberías de agua o desagüe', '2025-11-02 11:09:52'),
(20, 1, 'Desagüe', 'Sistemas de drenaje', '2025-11-02 11:09:52'),
(21, 2, 'Computador', 'Computadores de escritorio', '2025-11-02 11:09:53'),
(22, 2, 'Portátil', 'Computadores portátiles', '2025-11-02 11:09:53'),
(23, 2, 'Proyector', 'Video beams y proyectores', '2025-11-02 11:09:53'),
(24, 2, 'Pantalla', 'Pantallas de proyección', '2025-11-02 11:09:53'),
(25, 2, 'Aire Acondicionado', 'Equipos de climatización', '2025-11-02 11:09:53'),
(26, 2, 'Ventilador', 'Ventiladores de techo o pared', '2025-11-02 11:09:53'),
(27, 2, 'Impresora', 'Impresoras y fotocopiadoras', '2025-11-02 11:09:53'),
(28, 2, 'Red WiFi', 'Conexión a internet inalámbrica', '2025-11-02 11:09:53'),
(29, 2, 'Cableado', 'Cables de red y electricidad', '2025-11-02 11:09:53'),
(30, 2, 'Tablero Eléctrico', 'Breakers y tableros eléctricos', '2025-11-02 11:09:53'),
(31, 2, 'Toma Corriente', 'Enchufes y conexiones eléctricas', '2025-11-02 11:09:53'),
(32, 2, 'Micrófono', 'Micrófonos y equipos de audio', '2025-11-02 11:09:53'),
(33, 2, 'Parlantes', 'Altavoces y sistemas de sonido', '2025-11-02 11:09:53'),
(34, 2, 'Router', 'Routers y equipos de red', '2025-11-02 11:09:53'),
(35, 2, 'Switch', 'Switches de red', '2025-11-02 11:09:53'),
(36, 2, 'Cámara Web', 'Cámaras para videoconferencias', '2025-11-02 11:09:53'),
(37, 2, 'Monitor', 'Pantallas de computador', '2025-11-02 11:09:53'),
(38, 2, 'Teclado', 'Teclados de computador', '2025-11-02 11:09:53'),
(39, 2, 'Mouse', 'Ratones de computador', '2025-11-02 11:09:53'),
(40, 2, 'UPS', 'Sistemas de energía ininterrumpida', '2025-11-02 11:09:53'),
(41, 3, 'Cerradura', 'Cerraduras y chapas', '2025-11-02 11:09:53'),
(42, 3, 'Cámara de Seguridad', 'Cámaras de vigilancia', '2025-11-02 11:09:53'),
(43, 3, 'Extintor', 'Extintores de incendios', '2025-11-02 11:09:53'),
(44, 3, 'Alarma', 'Sistemas de alarma', '2025-11-02 11:09:53'),
(45, 3, 'Señalización', 'Señales de evacuación o seguridad', '2025-11-02 11:09:53'),
(46, 3, 'Iluminación de Emergencia', 'Luces de emergencia', '2025-11-02 11:09:53'),
(47, 3, 'Botiquín', 'Botiquines de primeros auxilios', '2025-11-02 11:09:53'),
(48, 3, 'Valla', 'Vallas y cercas de seguridad', '2025-11-02 11:09:53'),
(49, 3, 'Candado', 'Candados y sistemas de cierre', '2025-11-02 11:09:53'),
(50, 3, 'Detector de Humo', 'Detectores de humo e incendios', '2025-11-02 11:09:53'),
(51, 3, 'Salida de Emergencia', 'Puertas de emergencia', '2025-11-02 11:09:53'),
(52, 3, 'Hidrante', 'Hidrantes y mangueras contra incendios', '2025-11-02 11:09:53'),
(53, 4, 'Basura Acumulada', 'Acumulación de basura o desechos', '2025-11-02 11:09:53'),
(54, 4, 'Caneca', 'Canecas de basura dañadas o faltantes', '2025-11-02 11:09:53'),
(55, 4, 'Baño Sucio', 'Sanitarios en mal estado de limpieza', '2025-11-02 11:09:53'),
(56, 4, 'Piso Sucio', 'Pisos sin limpieza', '2025-11-02 11:09:53'),
(57, 4, 'Vidrios Sucios', 'Ventanas y vidrios sin limpiar', '2025-11-02 11:09:53'),
(58, 4, 'Grafiti', 'Pintas o grafitis en paredes', '2025-11-02 11:09:53'),
(59, 4, 'Polvo', 'Acumulación de polvo', '2025-11-02 11:09:53'),
(60, 4, 'Desorden', 'Áreas desordenadas', '2025-11-02 11:09:53'),
(61, 4, 'Malos Olores', 'Olores desagradables', '2025-11-02 11:09:53'),
(62, 4, 'Plagas', 'Presencia de insectos o roedores', '2025-11-02 11:09:53'),
(63, 5, 'Jardín', 'Jardines y áreas verdes', '2025-11-02 11:09:53'),
(64, 5, 'Cancha', 'Canchas deportivas', '2025-11-02 11:09:53'),
(65, 5, 'Parqueadero', 'Estacionamientos', '2025-11-02 11:09:53'),
(66, 5, 'Cafetería', 'Área de cafetería', '2025-11-02 11:09:53'),
(67, 5, 'Bebedero', 'Bebederos de agua', '2025-11-02 11:09:53'),
(68, 5, 'Auditorio', 'Auditorios y salas múltiples', '2025-11-02 11:09:53'),
(69, 5, 'Biblioteca', 'Instalaciones de biblioteca', '2025-11-02 11:09:53'),
(70, 5, 'Pasillo', 'Pasillos y corredores', '2025-11-02 11:09:53'),
(71, 5, 'Rampa', 'Rampas de accesibilidad', '2025-11-02 11:09:53'),
(72, 5, 'Ascensor', 'Elevadores', '2025-11-02 11:09:53'),
(73, 5, 'Otro', 'Objeto no especificado', '2025-11-02 11:09:53'),
(74, 5, 'Desconocido', 'Objeto sin identificar', '2025-11-02 11:09:53'),
(75, 6, 'Fuga de gas', 'Olor fuerte a gas, posible fuga en laboratorio/cafetería. Cerrar llaves y evacuar.', '2025-11-12 09:40:52'),
(76, 6, 'Cortocircuito', 'Chisporroteo u olor a quemado en toma o tablero; breaker disparado.', '2025-11-12 09:40:52'),
(77, 6, 'Conato de incendio', 'Inicio de fuego controlable con extintor cercano.', '2025-11-12 09:40:52'),
(78, 6, 'Incendio activo', 'Fuego extendido; activar alarma y evacuar.', '2025-11-12 09:40:52'),
(79, 6, 'Humo anormal', 'Presencia de humo sin fuente clara; posible riesgo eléctrico o químico.', '2025-11-12 09:40:52'),
(80, 6, 'Inundación', 'Acumulación rápida de agua por rotura o lluvias; riesgo eléctrico/estructural.', '2025-11-12 09:40:52'),
(81, 6, 'Fuga de agua', 'Pérdida constante en tubería/llave; puede dañar infraestructura o equipos.', '2025-11-12 09:40:52'),
(82, 6, 'Ascensor averiado con personas', 'Personas atrapadas; coordinar rescate seguro.', '2025-11-12 09:40:52'),
(83, 6, 'Colapso estructural inminente', 'Techo/pared con riesgo de caída; acordonar y evacuar zona.', '2025-11-12 09:40:52'),
(84, 6, 'Vidrio roto peligroso', 'Fragmentos sueltos con riesgo de cortaduras; señalizar y aislar.', '2025-11-12 09:40:52'),
(85, 6, 'Falla crítica de red', 'Caída de red/WiFi que impacta evaluaciones o eventos masivos.', '2025-11-12 09:40:52'),
(86, 6, 'Falla crítica de servidor', 'Servicios institucionales indisponibles (correo, LMS, SIU, etc.).', '2025-11-12 09:40:52'),
(87, 6, 'Planta eléctrica sin respuesta', 'Planta de respaldo no arranca durante apagón; afecta operación.', '2025-11-12 09:40:52'),
(88, 6, 'Alarma contra incendios fallando', 'No activa o falsos positivos reiterados; afecta evacuaciones.', '2025-11-12 09:40:52'),
(89, 6, 'Hidrante/extintor inoperativo', 'Sin presión/carga; imposible atender conato o incendio.', '2025-11-12 09:40:52'),
(90, 6, 'Salida de emergencia obstruida', 'Ruta o puerta bloqueada; incumple protocolo de evacuación.', '2025-11-12 09:40:52'),
(91, 6, 'Derrame de sustancia peligrosa', 'Químicos/biológicos fuera de contención; seguir protocolo HSE.', '2025-11-12 09:40:52'),
(92, 6, 'Amenaza a la seguridad', 'Intrusión, alteración del orden o riesgo directo a personas.', '2025-11-12 09:40:52'),
(93, 6, 'Electrocución potencial', 'Cables expuestos/zonas húmedas con tensión; alto riesgo.', '2025-11-12 09:40:52'),
(94, 6, 'Pozo/tapa de registro abierta', 'Hueco sin señalización; riesgo de caída.', '2025-11-12 09:40:52'),
(95, 6, 'Otro', 'Objeto no listado dentro de la categoría Urgencia.', '2025-11-12 09:40:52');

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
  `id_salon` int(11) DEFAULT NULL,
  `fecha_reporte` datetime DEFAULT NULL,
  `id_estado` int(11) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reportes`
--

INSERT INTO `reportes` (`id_reporte`, `id_objeto`, `id_usuario`, `id_categoria`, `titulo`, `descripcion`, `id_salon`, `fecha_reporte`, `id_estado`, `fecha_creacion`) VALUES
(2, 39, 2, 2, 'Mouse dañado en sala de cómputo', 'El mouse del equipo #7 no funciona; probado en otro puerto sin respuesta.', 65, '2025-11-04 16:25:10', 1, '2025-11-04 16:25:10'),
(3, NULL, 1, 1, 'Prueba de Reporte', 'Este es un reporte de prueba', 1, '2025-11-04 18:00:25', 2, '2025-11-04 18:00:25'),
(4, NULL, 1, 2, 'Segundo Reporte de Prueba', 'Este es otro reporte para verificar que funciona', 2, '2025-11-04 18:07:54', 1, '2025-11-04 18:07:54'),
(5, NULL, 1, 2, 'Pantalla rota', 'pantalla 10 rota', 66, '2025-11-04 18:36:51', 1, '2025-11-04 18:36:51'),
(6, NULL, 3, 1, 'Luces dañadas', 'Varias luces parecen quemadas porque no prenden', 48, '2025-11-05 00:00:00', 1, '2025-11-04 19:52:48'),
(7, NULL, 6, 1, 'el ascensor no sirve', 'el ascensor dejo de servir', 36, '2025-11-01 00:00:00', 1, '2025-11-05 09:05:41'),
(8, NULL, 1, 4, 'limpieza', 'sssssssssssssss', 65, '2025-11-05 09:22:00', 1, '2025-11-05 09:23:07'),
(9, NULL, 3, 1, 'Luces dañadas.', 'Prueba de guardado de imagen', 66, '2025-10-25 00:00:00', 1, '2025-11-05 18:18:02'),
(10, NULL, 3, 5, 'Prueba manejo de archivos.', 'Prueba manejo de archivos', 36, '2025-11-03 00:00:00', 1, '2025-11-06 09:31:14'),
(11, NULL, 3, 2, 'Prueba de vista archivos y comentario(edición).', 'ver si los comentarios funcionan y se pueden ver fotos y videos..\n\nviendo si funciona la edición...', 28, '2025-11-06 00:00:00', 4, '2025-11-06 16:53:07'),
(12, NULL, 6, 1, 'Prueba de función reporte', 'ver si funciona el crear reporte despues de eliminarlo del admin', 47, '2025-10-09 00:00:00', 3, '2025-11-07 10:57:52'),
(13, NULL, 7, 2, 'Prueba de pantalla detalles.', 'Prueba de pantalla detalles, los archivos y historial de cambios(listo).\r\nverificación que ya no sale siempre que se mórfico la fecha', 66, '2025-11-08 05:00:00', 1, '2025-11-09 10:45:23'),
(14, NULL, 3, 6, 'Prueba opcion de urgencia', 'Reporte de prueba para que haga notificacion de urgencia', 66, '2025-11-12 09:41:00', 2, '2025-11-12 09:42:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salones`
--

CREATE TABLE `salones` (
  `id_salon` int(11) NOT NULL,
  `ubicacion` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `salones`
--

INSERT INTO `salones` (`id_salon`, `ubicacion`, `nombre`, `capacidad`, `tipo`, `fecha_creacion`) VALUES
(1, 6, 'MCS 101', 40, 'Aula', '2025-11-02 00:00:00'),
(2, 6, 'MCS 102', 40, 'Aula', '2025-11-02 00:00:00'),
(3, 6, 'MCS 103', 40, 'Aula', '2025-11-02 00:00:00'),
(4, 6, 'MCS 104', 40, 'Aula', '2025-11-02 00:00:00'),
(5, 6, 'MCS 105', 40, 'Aula', '2025-11-02 00:00:00'),
(6, 6, 'MCS 106', 40, 'Aula', '2025-11-02 00:00:00'),
(7, 6, 'MCS 107', 40, 'Aula', '2025-11-02 00:00:00'),
(8, 6, 'MCS 108', 40, 'Aula', '2025-11-02 00:00:00'),
(9, 6, 'MCS 201', 40, 'Aula', '2025-11-02 00:00:00'),
(10, 6, 'MCS 202', 40, 'Aula', '2025-11-02 00:00:00'),
(11, 6, 'MCS 203', 40, 'Aula', '2025-11-02 00:00:00'),
(12, 6, 'MCS 204', 40, 'Aula', '2025-11-02 00:00:00'),
(13, 6, 'MCS 205', 40, 'Aula', '2025-11-02 00:00:00'),
(14, 6, 'MCS 206', 40, 'Aula', '2025-11-02 00:00:00'),
(15, 6, 'MCS 207', 40, 'Aula', '2025-11-02 00:00:00'),
(16, 6, 'MCS 208', 40, 'Aula', '2025-11-02 00:00:00'),
(17, 6, 'MCS 301', 40, 'Aula', '2025-11-02 00:00:00'),
(18, 6, 'MCS 302', 40, 'Aula', '2025-11-02 00:00:00'),
(19, 6, 'MCS 303', 40, 'Aula', '2025-11-02 00:00:00'),
(20, 6, 'MCS 304', 40, 'Aula', '2025-11-02 00:00:00'),
(21, 6, 'MCS 305', 40, 'Aula', '2025-11-02 00:00:00'),
(22, 6, 'MCS 306', 40, 'Aula', '2025-11-02 00:00:00'),
(23, 6, 'MCS 307', 40, 'Aula', '2025-11-02 00:00:00'),
(24, 6, 'MCS 308', 40, 'Aula', '2025-11-02 00:00:00'),
(25, 6, 'MCS 401', 40, 'Aula', '2025-11-02 00:00:00'),
(26, 6, 'MCS 402', 40, 'Aula', '2025-11-02 00:00:00'),
(27, 6, 'MCS 403', 40, 'Aula', '2025-11-02 00:00:00'),
(28, 6, 'MCS 404', 40, 'Aula', '2025-11-02 00:00:00'),
(29, 6, 'MCS 405', 40, 'Aula', '2025-11-02 00:00:00'),
(30, 6, 'MCS 406', 40, 'Aula', '2025-11-02 00:00:00'),
(31, 6, 'MCS 407', 40, 'Aula', '2025-11-02 00:00:00'),
(32, 6, 'MCS 408', 40, 'Aula', '2025-11-02 00:00:00'),
(33, 6, 'MCN 101', 40, 'Aula', '2025-11-02 00:00:00'),
(34, 6, 'MCN 102', 40, 'Aula', '2025-11-02 00:00:00'),
(35, 6, 'MCN 103', 40, 'Aula', '2025-11-02 00:00:00'),
(36, 6, 'MCN 104', 40, 'Aula', '2025-11-02 00:00:00'),
(37, 6, 'MCN 105', 40, 'Aula', '2025-11-02 00:00:00'),
(38, 6, 'MCN 106', 40, 'Aula', '2025-11-02 00:00:00'),
(39, 6, 'MCN 107', 40, 'Aula', '2025-11-02 00:00:00'),
(40, 6, 'MCN 108', 40, 'Aula', '2025-11-02 00:00:00'),
(41, 6, 'MCN 201', 40, 'Aula', '2025-11-02 00:00:00'),
(42, 6, 'MCN 202', 40, 'Aula', '2025-11-02 00:00:00'),
(43, 6, 'MCN 203', 40, 'Aula', '2025-11-02 00:00:00'),
(44, 6, 'MCN 204', 40, 'Aula', '2025-11-02 00:00:00'),
(45, 6, 'MCN 205', 40, 'Aula', '2025-11-02 00:00:00'),
(46, 6, 'MCN 206', 40, 'Aula', '2025-11-02 00:00:00'),
(47, 6, 'MCN 207', 40, 'Aula', '2025-11-02 00:00:00'),
(48, 6, 'MCN 208', 40, 'Aula', '2025-11-02 00:00:00'),
(49, 6, 'MCN 301', 40, 'Aula', '2025-11-02 00:00:00'),
(50, 6, 'MCN 302', 40, 'Aula', '2025-11-02 00:00:00'),
(51, 6, 'MCN 303', 40, 'Aula', '2025-11-02 00:00:00'),
(52, 6, 'MCN 304', 40, 'Aula', '2025-11-02 00:00:00'),
(53, 6, 'MCN 305', 40, 'Aula', '2025-11-02 00:00:00'),
(54, 6, 'MCN 306', 40, 'Aula', '2025-11-02 00:00:00'),
(55, 6, 'MCN 307', 40, 'Aula', '2025-11-02 00:00:00'),
(56, 6, 'MCN 308', 40, 'Aula', '2025-11-02 00:00:00'),
(57, 6, 'MCN 401', 40, 'Aula', '2025-11-02 00:00:00'),
(58, 6, 'MCN 402', 40, 'Aula', '2025-11-02 00:00:00'),
(59, 6, 'MCN 403', 40, 'Aula', '2025-11-02 00:00:00'),
(60, 6, 'MCN 404', 40, 'Aula', '2025-11-02 00:00:00'),
(61, 6, 'MCN 405', 40, 'Aula', '2025-11-02 00:00:00'),
(62, 6, 'MCN 406', 40, 'Aula', '2025-11-02 00:00:00'),
(63, 6, 'MCN 407', 40, 'Aula', '2025-11-02 00:00:00'),
(64, 6, 'MCN 408', 40, 'Aula', '2025-11-02 00:00:00'),
(65, 11, 'Salón de Internet', 30, 'Laboratorio', '2025-11-02 00:00:00'),
(66, 11, 'Tecnología de la Información', 30, 'Laboratorio', '2025-11-02 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id_ubicacion` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id_ubicacion`, `nombre`, `descripcion`, `fecha_creacion`) VALUES
(1, 'Entrada Principal', NULL, '2025-11-02 00:00:00'),
(2, 'Admisiones, Registro y Control Académico', NULL, '2025-11-02 00:00:00'),
(3, 'Edificio Administrativo Roque Morelli Zárate', NULL, '2025-11-02 00:00:00'),
(4, 'Edificio de Aulas Sierra Nevada', NULL, '2025-11-02 00:00:00'),
(5, 'Edificio de Aulas Ciénaga Grande', NULL, '2025-11-02 00:00:00'),
(6, 'Edificio de Aulas Mar Caribe', NULL, '2025-11-02 00:00:00'),
(7, 'Oficina de Relaciones Internacionales - ORI', NULL, '2025-11-02 00:00:00'),
(8, 'Centro de Bienestar Universitario', NULL, '2025-11-02 00:00:00'),
(9, 'Bloque II', NULL, '2025-11-02 00:00:00'),
(10, 'Consultorios Programa de Atención Psicológica - PAP', NULL, '2025-11-02 00:00:00'),
(11, 'Bloque III - Salas de Aplicaciones Informáticas', NULL, '2025-11-02 00:00:00'),
(12, 'Bloque IV - Recursos Educativos', NULL, '2025-11-02 00:00:00'),
(13, 'Bloque V - Auditorio Julio Otero Muñoz', NULL, '2025-11-02 00:00:00'),
(14, 'Clínica Odontológica', NULL, '2025-11-02 00:00:00'),
(15, 'Bloque VI - Laboratorios', NULL, '2025-11-02 00:00:00'),
(16, 'Bloque VII - Biblioteca Germán Bula Meyer', NULL, '2025-11-02 00:00:00'),
(17, 'Dirección de Desarrollo Estudiantil', NULL, '2025-11-02 00:00:00'),
(18, 'Edificio Docente Ricardo Villalobos Rico', NULL, '2025-11-02 00:00:00'),
(19, 'Bloque VIII', NULL, '2025-11-02 00:00:00'),
(20, 'Departamento de Estudios Generales e Idiomas', NULL, '2025-11-02 00:00:00'),
(21, 'Crédito y Cartera', NULL, '2025-11-02 00:00:00'),
(22, 'Anfiteatro', NULL, '2025-11-02 00:00:00'),
(23, 'Hangares - Laboratorios Facultad de Ingenierías', NULL, '2025-11-02 00:00:00'),
(24, 'Clínica de Simulación', NULL, '2025-11-02 00:00:00'),
(25, 'Laboratorios de Arqueología y Antropología Forense', NULL, '2025-11-02 00:00:00'),
(26, 'Intropic - Laboratorio de Biología Molecular', NULL, '2025-11-02 00:00:00'),
(27, 'Edificio de Innovación y Emprendimiento', NULL, '2025-11-02 00:00:00'),
(28, 'Granja Experimental', NULL, '2025-11-02 00:00:00'),
(29, 'Bosque Seco', NULL, '2025-11-02 00:00:00'),
(30, 'Puntos Ágiles', NULL, '2025-11-02 00:00:00'),
(31, 'Plazoleta Central', NULL, '2025-11-02 00:00:00'),
(32, 'Plazoleta de Las Acacias', NULL, '2025-11-02 00:00:00'),
(33, 'Cafetería Central', NULL, '2025-11-02 00:00:00'),
(34, 'Lago', NULL, '2025-11-02 00:00:00'),
(35, 'Plazoleta de Los Almendros', NULL, '2025-11-02 00:00:00'),
(36, 'Hemiciclo Cultural Helado de Leche', NULL, '2025-11-02 00:00:00'),
(37, 'Cancha de Voleibol', NULL, '2025-11-02 00:00:00'),
(38, 'Cancha de Baloncesto', NULL, '2025-11-02 00:00:00'),
(39, 'Cancha de Fútbol Sala', NULL, '2025-11-02 00:00:00'),
(40, 'Cancha Múltiple', NULL, '2025-11-02 00:00:00'),
(41, 'Cancha de Tenis', NULL, '2025-11-02 00:00:00'),
(42, 'Cancha Alterna de Fútbol', NULL, '2025-11-02 00:00:00'),
(43, 'Parques Biosaludables', NULL, '2025-11-02 00:00:00'),
(44, 'Estadio de Fútbol y Pista Atlética', NULL, '2025-11-02 00:00:00'),
(45, 'Estadio de Sóftbol', NULL, '2025-11-02 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id_notificacion` int(11) NOT NULL,
  `id_usuario_destino` int(11) NOT NULL,
  `id_reporte` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `prioridad` tinyint(4) DEFAULT 1,
  `color` varchar(20) DEFAULT NULL,
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
  `foto_url` varchar(500) DEFAULT NULL,
  `codigo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `contrasena`, `fecha_creacion`, `rol`, `foto_url`, `codigo`) VALUES
(1, 'Administrador Principal', 'admin@uni.local', '$2a$10$cgAbG4rzgNyxzaRvrViXhuxu8o22VSuV6cMfv6GIVxPuWxd91hVwO', '2025-10-10 18:53:12', 'admin', NULL, '2024000001'),
(2, 'Rubén González', 'ruben@gmail.com', '$2y$10$IUUEy4I5pZsYvk8JegVdYOENgG97F6CTvEYcauubU2wjcJIxB4tEO', '2025-10-10 20:05:22', 'admin', NULL, '2019214026'),
(3, 'Adriana Olivares', 'adriana@gmail.com', '$2a$10$QKpX8RYhbLs0xLVjfR0Sg..zurdv8upVikbiUXj0bvYb27t0aJC4G', '2025-10-11 11:25:45', 'monitor', 'uploads/profile-pictures/user_3_1762732420196.png', '2014214026'),
(6, 'yineth avila', 'yine@gmail.com', '$2a$10$3dxIIhsdMI2hyIA6VhgoMueb8nNzvFO19OBkk.74PbjV/o8.nYvZa', '2025-10-31 15:02:05', 'monitor', NULL, '2020235281'),
(7, 'usuario pruebas', 'prueba@unimagdalena.edu.co', '$2a$10$1WwEIjpr47ZCbmSwM8ZUu.ipUrX02SN8yMtmz0ZfdvW7vuK1EqiS2', '2025-11-09 10:42:54', 'monitor', NULL, '2020202020');

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
-- Indices de la tabla `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`id_estado`),
  ADD UNIQUE KEY `uq_estados_nombre` (`nombre`);

--
-- Indices de la tabla `historial_cambios`
--
ALTER TABLE `historial_cambios`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `idx_hist_reporte_fecha` (`id_reporte`,`fecha`),
  ADD KEY `idx_hist_reporte_tipo` (`id_reporte`,`tipo`),
  ADD KEY `hist_fk_estado_old` (`id_estado_anterior`),
  ADD KEY `hist_fk_estado_new` (`id_estado_nuevo`),
  ADD KEY `hist_fk_usuario_actor` (`id_usuario_actor`),
  ADD KEY `hist_fk_usuario_asig` (`id_usuario_asignado`),
  ADD KEY `hist_fk_dep_asig` (`id_dependencia_asignada`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `idx_notif_usuario` (`id_usuario_destino`),
  ADD KEY `idx_notif_reporte` (`id_reporte`),
  ADD KEY `idx_notif_leida` (`leida`),
  ADD KEY `idx_notif_fecha` (`fecha_creacion`);

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
  ADD KEY `id_objeto` (`id_objeto`),
  ADD KEY `id_salon` (`id_salon`),
  ADD KEY `id_estado` (`id_estado`);

--
-- Indices de la tabla `salones`
--
ALTER TABLE `salones`
  ADD PRIMARY KEY (`id_salon`),
  ADD KEY `ubicacion` (`ubicacion`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id_ubicacion`),
  ADD UNIQUE KEY `nombre` (`nombre`);

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
  MODIFY `id_archivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `comentarios`
--
ALTER TABLE `comentarios`
  MODIFY `id_comentario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `dependencias`
--
ALTER TABLE `dependencias`
  MODIFY `id_dependencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estados`
--
ALTER TABLE `estados`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `historial_cambios`
--
ALTER TABLE `historial_cambios`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id_notificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `objetos`
--
ALTER TABLE `objetos`
  MODIFY `id_objeto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `salones`
--
ALTER TABLE `salones`
  MODIFY `id_salon` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id_ubicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
-- Filtros para la tabla `historial_cambios`
--
ALTER TABLE `historial_cambios`
  ADD CONSTRAINT `hist_fk_dep_asig` FOREIGN KEY (`id_dependencia_asignada`) REFERENCES `dependencias` (`id_dependencia`) ON DELETE SET NULL,
  ADD CONSTRAINT `hist_fk_estado_new` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `estados` (`id_estado`),
  ADD CONSTRAINT `hist_fk_estado_old` FOREIGN KEY (`id_estado_anterior`) REFERENCES `estados` (`id_estado`),
  ADD CONSTRAINT `hist_fk_reporte` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id_reporte`) ON DELETE CASCADE,
  ADD CONSTRAINT `hist_fk_usuario_actor` FOREIGN KEY (`id_usuario_actor`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  ADD CONSTRAINT `hist_fk_usuario_asig` FOREIGN KEY (`id_usuario_asignado`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notif_fk_usuario` FOREIGN KEY (`id_usuario_destino`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `notif_fk_reporte` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id_reporte`) ON DELETE CASCADE;

--
-- Filtros para la tabla `objetos`
--
ALTER TABLE `objetos`
  ADD CONSTRAINT `objetos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL;

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_fk_estado` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id_estado`),
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  ADD CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL,
  ADD CONSTRAINT `reportes_ibfk_3` FOREIGN KEY (`id_objeto`) REFERENCES `objetos` (`id_objeto`) ON DELETE SET NULL,
  ADD CONSTRAINT `reportes_ibfk_4` FOREIGN KEY (`id_salon`) REFERENCES `salones` (`id_salon`) ON DELETE SET NULL;

--
-- Filtros para la tabla `salones`
--
ALTER TABLE `salones`
  ADD CONSTRAINT `salones_fk_ubicacion` FOREIGN KEY (`ubicacion`) REFERENCES `ubicaciones` (`id_ubicacion`) ON DELETE CASCADE;

--
-- Triggers para notificaciones automáticas
--

-- Trigger: Notificar cuando se cambia el estado de un reporte
DELIMITER $$
CREATE TRIGGER `notif_reporte_cambio_estado`
AFTER UPDATE ON `reportes`
FOR EACH ROW
BEGIN
  IF OLD.id_estado != NEW.id_estado THEN
    -- Notificar al creador del reporte
    INSERT INTO notificaciones (id_usuario_destino, id_reporte, tipo, titulo, mensaje, prioridad, color)
    VALUES (
      NEW.id_usuario,
      NEW.id_reporte,
      'cambio_estado',
      CONCAT('Estado actualizado: ', NEW.titulo),
      CONCAT('El estado de tu reporte ha cambiado a "', (SELECT nombre FROM estados WHERE id_estado = NEW.id_estado), '"'),
      2,
      'azul'
    );
  END IF;
END$$
DELIMITER ;

-- Trigger: Notificar cuando se agrega un comentario
DELIMITER $$
CREATE TRIGGER `notif_comentario_nuevo`
AFTER INSERT ON `comentarios`
FOR EACH ROW
BEGIN
  DECLARE reporte_usuario INT;
  DECLARE reporte_titulo VARCHAR(255);
  
  -- Obtener el creador del reporte
  SELECT id_usuario, titulo INTO reporte_usuario, reporte_titulo
  FROM reportes
  WHERE id_reporte = NEW.id_reporte;
  
  -- Notificar al creador del reporte (si no es quien comentó)
  IF reporte_usuario != NEW.id_usuario THEN
    INSERT INTO notificaciones (id_usuario_destino, id_reporte, tipo, titulo, mensaje, prioridad, color)
    VALUES (
      reporte_usuario,
      NEW.id_reporte,
      'comentario',
      CONCAT('Nuevo comentario en: ', reporte_titulo),
      CONCAT((SELECT nombre FROM usuarios WHERE id_usuario = NEW.id_usuario), ' ha comentado en tu reporte'),
      2,
      'verde'
    );
  END IF;
END$$
DELIMITER ;

-- Trigger: Notificar a administradores cuando se crea un nuevo reporte
DELIMITER $$
CREATE TRIGGER `notif_nuevo_reporte`
AFTER INSERT ON `reportes`
FOR EACH ROW
BEGIN
  DECLARE es_urgente BOOLEAN DEFAULT FALSE;
  DECLARE cat_nombre VARCHAR(200);
  DECLARE mensaje_notif TEXT;
  DECLARE titulo_notif VARCHAR(255);
  DECLARE prioridad_notif TINYINT DEFAULT 2;
  DECLARE color_notif VARCHAR(20) DEFAULT 'azul';
  
  -- Verificar si es categoría urgente (id=6 o nombre contiene "urgencia")
  SELECT nombre INTO cat_nombre
  FROM categorias
  WHERE id_categoria = NEW.id_categoria;
  
  IF NEW.id_categoria = 6 OR cat_nombre LIKE '%urgencia%' THEN
    SET es_urgente = TRUE;
    SET prioridad_notif = 3;
    SET color_notif = 'rojo';
    SET titulo_notif = CONCAT('🚨 URGENTE: ', NEW.titulo);
    SET mensaje_notif = CONCAT('Nuevo reporte URGENTE creado por ', (SELECT nombre FROM usuarios WHERE id_usuario = NEW.id_usuario));
  ELSE
    SET titulo_notif = CONCAT('Nuevo reporte: ', NEW.titulo);
    SET mensaje_notif = CONCAT('Reporte creado por ', (SELECT nombre FROM usuarios WHERE id_usuario = NEW.id_usuario));
  END IF;
  
  -- Notificar a todos los administradores excepto al creador
  INSERT INTO notificaciones (id_usuario_destino, id_reporte, tipo, titulo, mensaje, prioridad, color)
  SELECT 
    id_usuario,
    NEW.id_reporte,
    'nuevo_reporte',
    titulo_notif,
    mensaje_notif,
    prioridad_notif,
    color_notif
  FROM usuarios
  WHERE rol = 'admin' AND id_usuario != NEW.id_usuario;
END$$
DELIMITER ;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
