import * as Yup from 'yup';
import HelpOrders from '../schemas/HelpOrders';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class AnswerController {
  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { id } = req.params;
    const { answer } = req.body;

    const helporder = await HelpOrders.findByIdAndUpdate(
      id,
      { answer, answer_at: new Date() },
      { new: true }
    );

    if (!helporder) {
      return res.status(400).json({ error: 'Help-Orders not found' });
    }

    const student = await Student.findByPk(helporder.student);

    Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'REPOSTA GYMPOINT',
      template: 'answer',
      context: {
        student: student.name,
        question: helporder.question,
        answer: helporder.answer,
      },
    });

    return res.json(helporder);
  }

  async index(req, res) {
    const { id } = req.params;

    const studentExists = await Student.findByPk(id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student not exists' });
    }

    const helporders = await HelpOrders.find({
      student: id,
      answer: null,
    }).sort({ createdAt: 'desc' });

    return res.json(helporders);
  }
}

export default new AnswerController();
