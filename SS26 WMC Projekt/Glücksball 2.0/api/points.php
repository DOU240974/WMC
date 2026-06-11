<?php
declare(strict_types=1);

function refresh_tip_points(PDO $pdo): void {
  $pdo->exec("
    UPDATE tipps t
    JOIN spiele s ON s.id = t.spiel_id
    SET t.points = CASE
      WHEN s.score_home IS NOT NULL
       AND s.score_away IS NOT NULL
       AND t.tipp_home IS NOT NULL
       AND t.tipp_away IS NOT NULL
       AND t.tipp_home = s.score_home
       AND t.tipp_away = s.score_away
      THEN 3

      WHEN s.score_home IS NOT NULL
       AND s.score_away IS NOT NULL
       AND t.tipp_home IS NOT NULL
       AND t.tipp_away IS NOT NULL
       AND (
        (t.tipp_home > t.tipp_away AND s.score_home > s.score_away) OR
        (t.tipp_home < t.tipp_away AND s.score_home < s.score_away) OR
        (t.tipp_home = t.tipp_away AND s.score_home = s.score_away)
       )
      THEN 1

      ELSE 0
    END
  ");
}

function calc_tip_points(?int $predHome, ?int $predAway, ?int $realHome, ?int $realAway): int {
  if ($realHome === null || $realAway === null || $predHome === null || $predAway === null) return 0;
  if ($predHome === $realHome && $predAway === $realAway) return 3;

  $predDiff = $predHome - $predAway;
  $realDiff = $realHome - $realAway;
  if ($predDiff === 0 && $realDiff === 0) return 1;
  if (($predDiff > 0 && $realDiff > 0) || ($predDiff < 0 && $realDiff < 0)) return 1;

  return 0;
}