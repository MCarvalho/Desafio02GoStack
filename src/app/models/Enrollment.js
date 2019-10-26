import Sequelize, { Model } from 'sequelize';
import { startOfDay, addMonths } from 'date-fns';

class Enrollment extends Model {
  static init(sequelize) {
    super.init(
      {
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        price: Sequelize.DECIMAL(10, 2),
        duration: Sequelize.VIRTUAL,
        price_month: Sequelize.VIRTUAL,
      },
      {
        sequelize,
      }
    );
    this.addHook('beforeSave', async enrollment => {
      if (enrollment.duration && enrollment.price_month) {
        enrollment.end_date = addMonths(
          startOfDay(enrollment.start_date),
          enrollment.duration
        );
        enrollment.price = enrollment.price_month * enrollment.duration;
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, { foreignKey: 'student_id' });
    this.belongsTo(models.Plan, { foreignKey: 'plan_id' });
  }
}

export default Enrollment;
