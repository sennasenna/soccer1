-- 获取指定联赛和庄家的赛程及赔率数据（通过 match_id inner join）
CREATE OR REPLACE FUNCTION get_schedule_with_odds(
    p_league TEXT,
    p_bookmaker_id BIGINT,
    p_current_time TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    match_id BIGINT,
    league TEXT,
    match_time TIMESTAMP WITH TIME ZONE,
    home_team TEXT,
    away_team TEXT,
    schedule_created_at TIMESTAMP WITH TIME ZONE,

    -- 赔率数据字段
    odds_id BIGINT,
    bookmaker_id BIGINT,
    win REAL,
    draw REAL,
    lose REAL,
    home REAL,
    handicap REAL,
    away REAL,
    overunder REAL,
    over REAL,
    under REAL,
    odds_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.match_id,
        s.league,
        s.match_time,
        s.home_team,
        s.away_team,
        s.created_at as schedule_created_at,

        o.id as odds_id,
        o.bookmaker_id,
        o.win,
        o.draw,
        o.lose,
        o.home,
        o.handicap,
        o.away,
        o.overunder,
        o.over,
        o.under,
        o.created_at as odds_created_at
    FROM
        schedule s
    INNER JOIN
        odds o ON s.match_id = o.match_id
    WHERE
        s.league = p_league
        AND o.bookmaker_id = p_bookmaker_id
        AND s.match_time > p_current_time
    ORDER BY
        s.match_time ASC;
END;
$$ LANGUAGE plpgsql;