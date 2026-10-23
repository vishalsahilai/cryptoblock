CREATE TRIGGER prediction_snapshot_immutable BEFORE UPDATE ON predictions
WHEN NEW.id IS NOT OLD.id OR NEW.symbol IS NOT OLD.symbol OR NEW.horizon IS NOT OLD.horizon OR NEW.model_version IS NOT OLD.model_version OR NEW.created_at IS NOT OLD.created_at OR NEW.as_of IS NOT OLD.as_of OR NEW.due_at IS NOT OLD.due_at OR NEW.reference_price IS NOT OLD.reference_price OR NEW.predicted_pct IS NOT OLD.predicted_pct OR NEW.target_price IS NOT OLD.target_price OR NEW.low_price IS NOT OLD.low_price OR NEW.high_price IS NOT OLD.high_price OR NEW.snapshot IS NOT OLD.snapshot OR NEW.source IS NOT OLD.source
BEGIN SELECT RAISE(ABORT,'Original forecast is immutable'); END;
--> statement-breakpoint
CREATE TRIGGER prediction_result_final BEFORE UPDATE ON predictions
WHEN OLD.actual_price IS NOT NULL AND (NEW.actual_price IS NOT OLD.actual_price OR NEW.actual_pct IS NOT OLD.actual_pct OR NEW.direction_hit IS NOT OLD.direction_hit OR NEW.error_pp IS NOT OLD.error_pp OR NEW.range_hit IS NOT OLD.range_hit OR NEW.evaluated_at IS NOT OLD.evaluated_at)
BEGIN SELECT RAISE(ABORT,'Verified result is final'); END;
--> statement-breakpoint
CREATE TRIGGER prediction_not_backdated BEFORE INSERT ON predictions
WHEN NEW.horizon NOT IN (2,3,7) OR NEW.created_at >= NEW.due_at OR NEW.as_of > NEW.created_at OR NEW.due_at != NEW.as_of + NEW.horizon * 86400000
BEGIN SELECT RAISE(ABORT,'Invalid prospective forecast'); END;
--> statement-breakpoint
CREATE TRIGGER prediction_not_early BEFORE UPDATE ON predictions
WHEN NEW.actual_price IS NOT NULL AND (NEW.evaluated_at IS NULL OR NEW.evaluated_at < OLD.due_at)
BEGIN SELECT RAISE(ABORT,'Forecast outcome is not due'); END;
