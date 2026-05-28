package com.salonhub.api.tenant;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import org.springframework.orm.jpa.EntityManagerFactoryUtils;
import org.springframework.orm.jpa.EntityManagerHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Helper used by {@link TenantInterceptor} to enable/disable the Hibernate
 * tenant filter on the current EntityManager session.
 *
 * Spring Boot's OpenEntityManagerInViewInterceptor binds one EntityManager
 * per request, so enabling the filter once in preHandle() applies to all
 * queries during the request and disabling in afterCompletion() reverts.
 *
 * If no EM is bound yet (rare — controller has zero JPA-using deps),
 * enable() is a no-op; the filter will be enabled later by the per-method
 * fallback in {@link TenantFilterAspect}.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TenantSessionConfigurer {

    private final EntityManagerFactory emf;

    public void enable(Long tenantId) {
        Session session = unwrapBoundSession();
        if (session == null) return;
        var filter = session.enableFilter(TenantFilter.NAME);
        filter.setParameter(TenantFilter.PARAM, tenantId);
    }

    public void disable() {
        Session session = unwrapBoundSession();
        if (session == null) return;
        session.disableFilter(TenantFilter.NAME);
    }

    private Session unwrapBoundSession() {
        var holder = (EntityManagerHolder) TransactionSynchronizationManager.getResource(emf);
        if (holder == null) return null;
        EntityManager em = holder.getEntityManager();
        if (em == null || !em.isOpen()) return null;
        try {
            return em.unwrap(Session.class);
        } catch (Exception e) {
            return null;
        }
    }
}
