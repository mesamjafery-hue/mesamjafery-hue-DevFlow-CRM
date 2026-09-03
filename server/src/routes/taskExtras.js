const express = require('express');
const { Task, Subtask, TaskComment } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { sendSuccess, sendError } = require('../utils/response');
const router = express.Router();
router.use(authMiddleware);

router.get('/:taskId/subtasks', authorize('tasks.view'), async (req, res, next) => { try { return sendSuccess(res, await Subtask.findAll({ where: { taskId: req.params.taskId }, order: [['createdAt', 'ASC']] })); } catch (error) { return next(error); } });
router.post('/:taskId/subtasks', authorize('tasks.create'), async (req, res, next) => { try { if (!await Task.findByPk(req.params.taskId)) return sendError(res, 'Task not found', 404); if (!req.body.title) return sendError(res, 'title is required', 400); return sendSuccess(res, await Subtask.create({ taskId: req.params.taskId, title: req.body.title, status: req.body.status, assigneeId: req.body.assigneeId || null }), 'Subtask created', 201); } catch (error) { return next(error); } });
router.patch('/subtasks/:id', authorize('tasks.update'), async (req, res, next) => { try { const record = await Subtask.findByPk(req.params.id); if (!record) return sendError(res, 'Subtask not found', 404); await record.update(req.body); return sendSuccess(res, record, 'Subtask updated'); } catch (error) { return next(error); } });
router.get('/:taskId/comments', authorize('tasks.view'), async (req, res, next) => { try { return sendSuccess(res, await TaskComment.findAll({ where: { taskId: req.params.taskId }, order: [['createdAt', 'ASC']] })); } catch (error) { return next(error); } });
router.post('/:taskId/comments', authorize('tasks.create'), async (req, res, next) => { try { if (!await Task.findByPk(req.params.taskId)) return sendError(res, 'Task not found', 404); if (!req.body.body) return sendError(res, 'body is required', 400); return sendSuccess(res, await TaskComment.create({ taskId: req.params.taskId, authorId: req.user.id, body: req.body.body }), 'Comment added', 201); } catch (error) { return next(error); } });
module.exports = router;
