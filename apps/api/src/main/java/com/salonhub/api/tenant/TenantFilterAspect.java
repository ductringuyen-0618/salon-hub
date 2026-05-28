package com.salonhub.api.tenant;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Belt-and-suspenders: wraps every @Transactional method to enable the
 * tenant filter on the session being used inside it. The HTTP interceptor
 * already enables the filter on the request-bound EntityManager, but
 * methods that open their own transaction (e.g. inside an @Async, or
 * during application startup) need their own enabling.
 *
 * Ordered high so we wrap before @Transactional opens the session.
 */
@Aspect
@Component
@Order(0)
@Slf4j
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Around("@within(org.springframework.transaction.annotation.Transactional) "
          + "|| @annotation(org.springframework.transaction.annotation.Transactional)")
    public Object enableFilter(ProceedingJoinPoint pjp) throws Throwable {
        Long tenantId = TenantContext.current();
        if (tenantId == null) {
            // Unscoped — system task, startup, etc. Don't enable the filter.
            return pjp.proceed();
        }
        Session session;
        try {
            session = entityManager.unwrap(Session.class);
        } catch (Exception e) {
            return pjp.proceed();
        }
        Filter f = session.enableFilter(TenantFilter.NAME);
        f.setParameter(TenantFilter.PARAM, tenantId);
        try {
            return pjp.proceed();
        } finally {
            session.disableFilter(TenantFilter.NAME);
        }
    }
}
