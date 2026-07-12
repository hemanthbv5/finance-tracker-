import cron from 'node-cron';
import Income from './models/Income.js';
import Expense from './models/Expense.js';

// Helper to determine if a transaction should trigger today based on its frequency
const shouldTrigger = (dateStr, frequency) => {
  if (!dateStr || !frequency || frequency === 'none') return false;
  
  const originalDate = new Date(dateStr);
  const today = new Date();
  
  // Normalize to midnight UTC for comparison
  const d1 = new Date(originalDate.toISOString().split('T')[0]);
  const d2 = new Date(today.toISOString().split('T')[0]);
  
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (frequency === 'daily') return diffDays > 0;
  if (frequency === 'weekly') return diffDays > 0 && diffDays % 7 === 0;
  if (frequency === 'monthly') return originalDate.getDate() === today.getDate() && diffDays > 0;
  if (frequency === 'yearly') return originalDate.getDate() === today.getDate() && originalDate.getMonth() === today.getMonth() && diffDays > 0;
  
  return false;
};

// Run every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily recurring transactions check...');
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Process recurring incomes
    const incomes = await Income.find({ isRecurring: true });
    for (const inc of incomes) {
      if (shouldTrigger(inc.date, inc.recurrenceFrequency)) {
        await Income.create({
          userId: inc.userId,
          amount: inc.amount,
          date: todayStr,
          category: inc.category,
          source: inc.source,
          notes: `${inc.notes} (Auto-generated)`.trim(),
          isRecurring: true,
          recurrenceFrequency: inc.recurrenceFrequency,
        });
        console.log(`✅ Generated recurring income for user ${inc.userId}`);
      }
    }

    // Process recurring expenses
    const expenses = await Expense.find({ isRecurring: true });
    for (const exp of expenses) {
      if (shouldTrigger(exp.date, exp.recurrenceFrequency)) {
        await Expense.create({
          userId: exp.userId,
          amount: exp.amount,
          date: todayStr,
          category: exp.category,
          paymentMethod: exp.paymentMethod,
          notes: `${exp.notes} (Auto-generated)`.trim(),
          isRecurring: true,
          recurrenceFrequency: exp.recurrenceFrequency,
        });
        console.log(`✅ Generated recurring expense for user ${exp.userId}`);
      }
    }
    
    console.log('🏁 Recurring transactions check complete.');
  } catch (err) {
    console.error('❌ Error processing recurring transactions:', err);
  }
});
